import { type PersistedState, persistedStateSchema } from '@/types/domain';
import { reconcile } from './essentials';

/*
 * The persistence seam. Components and the store never touch storage directly;
 * they go through this typed interface, backed by localStorage. Saved data is
 * parsed with Zod, so a corrupt, partial, or out-of-date shape safely falls
 * back to sensible defaults instead of crashing. The daily carry-over
 * (`reconcile`) is applied on read, so opening the app on a new day quietly
 * brings unfinished items forward.
 */

const STORAGE_KEY = 'essentials-v1';

export function createDefaultState(): PersistedState {
  return {
    version: 1,
    settings: {
      max: 3,
      theme: 'paper',
      accent: '#6f8a72',
      showIntention: true,
    },
    days: {},
    intentions: {},
  };
}

export interface Repository {
  getState(now?: Date): PersistedState;
  saveState(state: PersistedState): void;
  clear(): void;
}

export function createLocalStorageRepository(storage: Storage = localStorage): Repository {
  function read(): PersistedState {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return createDefaultState();
      }
      const parsed = persistedStateSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : createDefaultState();
    } catch {
      return createDefaultState();
    }
  }

  function getState(now: Date = new Date()): PersistedState {
    const state = read();
    const reconciled = reconcile({ days: state.days, intentions: state.intentions }, now);
    return { ...state, days: reconciled.days, intentions: reconciled.intentions };
  }

  function saveState(state: PersistedState): void {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode, quota). The app still works
      // for this session; we just cannot persist.
    }
  }

  function clear(): void {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
  }

  return { getState, saveState, clear };
}

export const repository: Repository = createLocalStorageRepository();
