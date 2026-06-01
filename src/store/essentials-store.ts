import { create } from 'zustand';
import { repository } from '@/lib/repository';
import type { Accent, Essential, Settings, Theme } from '@/types/domain';

/*
 * The whole app state. The Today/Tomorrow view is ephemeral UI state and lives
 * in the component, not here. Every mutation writes through the repository so
 * persistence stays in one place.
 */
interface EssentialsState {
  settings: Settings;
  days: Record<string, Essential[]>;
  intentions: Record<string, string>;
  // List actions, scoped to a day key.
  add: (dayKey: string, text: string) => void;
  toggle: (dayKey: string, id: string) => void;
  remove: (dayKey: string, id: string) => void;
  setIntention: (dayKey: string, text: string) => void;
  // Settings actions.
  setMax: (max: number) => void;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  setShowIntention: (show: boolean) => void;
}

const initial = repository.getState();

// A monotonic counter keeps ids unique within a session without Math.random.
let idCounter = 0;
function newId(): string {
  idCounter += 1;
  return `e${Date.now()}-${idCounter}`;
}

export const useEssentialsStore = create<EssentialsState>((set, get) => {
  function persist(): void {
    const { settings, days, intentions } = get();
    repository.saveState({ version: 1, settings, days, intentions });
  }

  function setDay(dayKey: string, next: Essential[]): void {
    set({ days: { ...get().days, [dayKey]: next } });
    persist();
  }

  function patchSettings(patch: Partial<Settings>): void {
    set({ settings: { ...get().settings, ...patch } });
    persist();
  }

  return {
    settings: initial.settings,
    days: initial.days,
    intentions: initial.intentions,

    add: (dayKey, text) => {
      const trimmed = text.trim();
      const list = get().days[dayKey] ?? [];
      // The hard cap: at or above max, adding is silently refused.
      if (!trimmed || list.length >= get().settings.max) {
        return;
      }
      setDay(dayKey, [...list, { id: newId(), text: trimmed, done: false }]);
    },

    toggle: (dayKey, id) => {
      const list = get().days[dayKey] ?? [];
      setDay(
        dayKey,
        list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
      );
    },

    remove: (dayKey, id) => {
      const list = get().days[dayKey] ?? [];
      setDay(
        dayKey,
        list.filter((item) => item.id !== id),
      );
    },

    setIntention: (dayKey, text) => {
      set({ intentions: { ...get().intentions, [dayKey]: text } });
      persist();
    },

    setMax: (max) => patchSettings({ max }),
    setTheme: (theme) => patchSettings({ theme }),
    setAccent: (accent) => patchSettings({ accent }),
    setShowIntention: (showIntention) => patchSettings({ showIntention }),
  };
});
