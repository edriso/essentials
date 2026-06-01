import { z } from 'zod';

/** One essential: a single short line with a checkbox. */
export const essentialSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean(),
  /** Set when this item was carried over from a past, unfinished day. */
  carried: z.boolean().optional(),
});
export type Essential = z.infer<typeof essentialSchema>;

export const THEMES = ['paper', 'dark'] as const;
export const themeSchema = z.enum(THEMES);
export type Theme = z.infer<typeof themeSchema>;

/** The muted accent swatches — all equally barely-there. */
export const ACCENTS = ['#6f8a72', '#8a8276', '#6f86a3', '#b08a6a', '#9a7f9c'] as const;
export const accentSchema = z.enum(ACCENTS);
export type Accent = z.infer<typeof accentSchema>;

/** Look and restraint preferences. `max` is the hard cap on a day's list. */
export const settingsSchema = z.object({
  max: z.number().int().min(1).max(5),
  theme: themeSchema,
  accent: accentSchema,
  showIntention: z.boolean(),
});
export type Settings = z.infer<typeof settingsSchema>;

/**
 * The lists themselves: one short array of essentials per local day key
 * (YYYY-MM-DD), and an optional one-line intention per day.
 */
export const daysStateSchema = z.object({
  days: z.record(z.string(), z.array(essentialSchema)),
  intentions: z.record(z.string(), z.string()),
});
export type DaysState = z.infer<typeof daysStateSchema>;

/** Everything we persist, wrapped with a version for safe future migrations. */
export const persistedStateSchema = z.object({
  version: z.literal(1),
  settings: settingsSchema,
  days: z.record(z.string(), z.array(essentialSchema)),
  intentions: z.record(z.string(), z.string()),
});
export type PersistedState = z.infer<typeof persistedStateSchema>;
