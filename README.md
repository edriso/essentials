# Essentials

A **frontend-only** web app for focusing on only the few things that matter
today — and, gently, tomorrow. It's an **antidote to overwhelm**: when you feel
cluttered and scattered, Essentials makes you feel calm and clear through one
piece of radical restraint — **a hard cap on your list (default 3).** At the cap
you literally cannot add more. That constraint _is_ the product.

There is no backend, no account, and no network. Everything lives on your device
and the app works fully offline.

---

## What it does

A single, calm, centered column — no nav bar, no dashboard, no sidebar.

- **Two views: Today / Tomorrow** — two quiet tabs, each its own short list.
- **Up to N essentials per day (default 3, a hard cap).** Each is one short line
  with a round checkbox. Tap to complete and it strikes through, fades, and
  sinks below the unfinished ones. Hover reveals a small × to remove it.
- **The top unfinished item is "the one"** — rendered noticeably larger as the
  main focus; the rest sit quietly beneath.
- **At the cap** the "add" affordance disappears and a quiet line reads
  "3 is enough. Focus here." **Below the cap**, one understated "add an
  essential" reveals an inline input (Enter adds, Esc or blur cancels).
- **Gentle carry-over:** on a new day, any unfinished items from past days move
  into Today, tagged "carried over." Nothing is lost; nothing nags.
- **An optional one-line intention** per day, in quiet italic under the date.
- **Calm states:** empty → "What matters this morning/afternoon/evening?";
  everything done → "That's everything. Rest now." No confetti, streaks, scores.

That is the entire app, on purpose. There are no projects, tags, priorities, due
times, reminders, multi-line notes, or analytics — and there won't be. Less is
the feature.

---

## Tech stack

- **React 19 + TypeScript** (strict), built with **Vite**
- **Tailwind CSS v4** (configured in CSS with `@theme`, no `tailwind.config.js`)
- **Zustand** for state (no router — Today/Tomorrow is local state)
- **Zod** validates the persisted shape
- **vite-plugin-pwa** so the app is installable and works offline
- **Vitest** + **Testing Library** for unit and component tests, **Playwright**
  for browser tests

---

## Getting started

You need **Node 20+** and **pnpm** (`npm install -g pnpm`).

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173>. There is nothing else to configure — no backend.

---

## Commands

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start the Vite dev server                 |
| `pnpm build`     | Type-check and build for production       |
| `pnpm preview`   | Preview the production build locally      |
| `pnpm lint`      | Run ESLint (must pass with zero warnings) |
| `pnpm format`    | Format every file with Prettier           |
| `pnpm typecheck` | Type-check without building               |
| `pnpm test`      | Run the unit and component tests (Vitest) |
| `pnpm test:e2e`  | Run the browser tests (Playwright)        |

Run `pnpm test:e2e:install` once to download the browser before `pnpm test:e2e`.

---

## How it is built

```
src/
├── components/          icon, overlay (presentational pieces)
├── features/essentials/ the screen, an item row, and the settings panel
├── store/               the Zustand store (settings, days, intentions)
├── hooks/               apply-theme
├── lib/                 pure logic & data: date, essentials (reconcile/order/cap), repository
├── types/               Zod schemas and the types they produce
└── styles/              the theme and layout CSS
```

A few ideas worth knowing:

- **All saving goes through one seam.** `lib/repository.ts` is a small typed
  interface (`getState` / `saveState`) backed by localStorage. Components and the
  store never touch storage directly. Saved data is parsed with Zod, so an old,
  partial, or corrupt shape safely falls back to defaults.
- **The carry-over is pure and well-tested.** `reconcile` (in `lib/essentials.ts`)
  is a plain function: on load it carries every _unfinished_ item from past days
  into today (de-duped by case-insensitive text, tagged `carried`) and drops the
  past days and their intentions. Today and Tomorrow are left exactly as they
  are. The cap check and the ordering (unfinished first by insertion order, done
  sunk) live there too, so they're tested without a browser.
- **Persistence is just localStorage.** Open the app the next day and unfinished
  things are quietly waiting in Today.

---

## Accessibility & motion

- The checkbox and the add input are real, keyboard-operable controls with ARIA
  labels; the date is a proper heading; focus rings are visible but tasteful.
- The settings panel traps focus and closes on Escape.
- The app honors `prefers-reduced-motion` (animations collapse to near zero) and
  `prefers-color-scheme`. Theme (paper / dark), accent, list size, and the
  intention line are all in the small settings panel.

---

## A note on calm

Essentials is meant to feel like an exhale — spare, serene, uncluttered. Some
days you'll finish all three; some days none. Either is fine. Choose the few that
truly count, and let the rest wait.

---

## License

MIT.
