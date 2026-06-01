import type { DaysState, Essential } from '@/types/domain';
import { keyOf } from './date';

/*
 * The one piece of real logic in Essentials, kept pure and well-tested.
 *
 * `reconcile` runs on load: it sweeps every past day, carries the *unfinished*
 * items into today (de-duped against today's list by case-insensitive text and
 * tagged `carried`), and drops the past days and their intentions entirely.
 * Nothing is lost; nothing from the past lingers to nag. Today and Tomorrow are
 * left exactly as they are.
 */
export function reconcile(state: DaysState, now: Date = new Date()): DaysState {
  const todayKey = keyOf(now);
  const days: Record<string, Essential[]> = { ...state.days };
  const intentions: Record<string, string> = { ...state.intentions };

  const carried: Essential[] = [];
  for (const key of Object.keys(days)) {
    if (key < todayKey) {
      for (const item of days[key]) {
        if (!item.done) {
          carried.push({ ...item, carried: true });
        }
      }
      delete days[key];
      delete intentions[key];
    }
  }

  if (carried.length > 0) {
    const existing = days[todayKey] ?? [];
    const existingTexts = new Set(existing.map((item) => normalizeText(item.text)));
    const fresh = carried.filter((item) => !existingTexts.has(normalizeText(item.text)));
    days[todayKey] = [...fresh, ...existing];
  }

  return { days, intentions };
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

/** Unfinished items first (in insertion order), completed items sunk below. */
export function orderEssentials(list: Essential[]): Essential[] {
  const undone = list.filter((item) => !item.done);
  const done = list.filter((item) => item.done);
  return [...undone, ...done];
}

/** True when the list has reached its hard cap and no more may be added. */
export function isFull(list: Essential[], max: number): boolean {
  return list.length >= max;
}

/** True when there is at least one item and every item is done. */
export function isAllDone(list: Essential[]): boolean {
  return list.length > 0 && list.every((item) => item.done);
}
