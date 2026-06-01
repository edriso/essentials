# CLAUDE.md — Essentials

Project memory for Claude Code. Read this before doing anything. Keep edits aligned with it; if you intentionally diverge, update this file in the same change.

## What Essentials is

A **frontend-only** web app for focusing on only the few things that matter today (and, gently, tomorrow). It's an **antidote to overwhelm**: the user feels cluttered and scattered; the app's whole job is to make them feel **calm and clear** through radical restraint. The defining rule: **a hard cap on the list (default 3)** — at the cap you literally cannot add more. That constraint _is_ the product.

No backend, no accounts, no network. All state local; works fully offline.

> **Restraint is the entire point.** Resist every urge to add features, sections, metrics, badges, priorities, tags, due times, reminders, or settings. If you're unsure whether something belongs, it doesn't. When in doubt, remove something. Less is the feature.

## Product shape (this is the whole app — do not extend it)

A single, calm, **centered column** — no nav bar, no dashboard, no sidebar.

- **Two views: Today / Tomorrow** — two quiet text tabs at top, each its own short list. No week view, no calendar.
- **Up to N essentials/day (default 3, hard cap).** One short line each + a round checkbox. Tap to complete → strikethrough, fade, sink below the unfinished. Hover reveals a small × to remove.
- **Top unfinished item = "the one"** — rendered noticeably larger (main focus); the rest sit beneath.
- **At the cap:** "add" disappears, a quiet line says "{N} is enough. Focus here." **Below cap:** one understated "add an essential" → inline input (Enter adds, Esc/blur cancels).
- **Gentle carry-over:** on a new day, unfinished past items move into Today, tagged "carried over." Nothing lost, nothing nags.
- **Optional one-line intention** per day (quiet italic under the date), toggleable.
- **Calm states:** empty → "What matters this morning/afternoon/evening?" + "Choose up to {N}…"; all done → "That's everything. Rest now." No confetti, streaks, or scores.

Explicitly **not** in scope: projects, tags, priorities, due times, reminders, multi-line notes, analytics, sharing, accounts.

## Design system — the calm IS the product

Default **paper**; also **dark** (warm, dim, never harsh/pure black). Sage `#6f8a72` is barely-there — only the checked state, the active tab, and the main-focus ring. Muted swatches (sage, taupe, dusty blue, clay, mauve); one accent; tints via `color-mix`.

- **Whitespace is the primary design element.** Single column, `max-width` ~560px, centered, very generous padding (`clamp(56px,12vh,130px)` top), big vertical rhythm. Items separated by hairline rules and air, not cards. Never busy or boxed-in.
- **Spectral** (serif) for essentials, the date, and the intention — large, with air. The main-focus item is larger still (~26px) and slightly heavier. **Hanken Grotesk** only for the tiny uppercase tab/label text (letter-spacing ~0.13em).
- Soft fade + 6px rise (~0.5s) on entry; smooth color transitions on check; theme cross-fade. Nothing bounces or celebrates. Honor `prefers-reduced-motion` and `prefers-color-scheme`.
- Two nearly-invisible top-corner controls (theme toggle + a quiet settings opener). Everything else is the page.

Voice: quiet, warm, unhurried, never productivity-hustle. "What matters this morning?" · "Choose up to 3. Just the few that truly count." · "3 is enough. Focus here." · "That's everything. Rest now." The app should feel like a calm exhale.

## Tech & architecture

- **React 19 + TypeScript (strict)**, **Vite**, **Tailwind v4** (CSS-first `@theme`, no config; Node 20+). Utilities restrained; lean on the CSS custom-property palette.
- **Zustand** for state. No router (Today/Tomorrow is local state). **Zod** validates persisted shape.
- **Persistence behind a typed `repository`** (`getState`/`saveState`) over localStorage. Components never touch storage directly. Zod parse with safe defaults.
- **`reconcile(state)` is the one piece of real logic** — pure and well-tested: carry unfinished past items into today (dedupe by case-insensitive text, tag `carried`), drop past days. Plus `keyOf`/`addDays`, the cap check, and ordering (unfinished first by insertion order, done sunk).
- **PWA**: installable, offline-first (vite-plugin-pwa + manifest, checkmark/paper icon).
- Tiny inline-SVG icons — no icon library.
- Folders: `components/`, `features/essentials/`, `store/`, `hooks/`, `lib/` (repository, date/essentials), `types/`, `styles/`. Shallow tree; co-locate tests.

### Conventions

- Naming: `PascalCase` components/types · `camelCase` functions/vars · `kebab-case` files · `SCREAMING_SNAKE_CASE` constants. One component per file; keep small.
- No `any` (`unknown` + narrowing). Path aliases. **Pure, unit-tested logic** for reconcile/cap/ordering — out of components.
- Accessibility: real keyboard-operable checkbox + add input with ARIA labels; date as a heading; tasteful visible focus rings; reduced-motion respected. Calm ≠ inaccessible.

## Commands

```bash
pnpm install
pnpm dev          # vite dev server
pnpm build        # type-check + production build
pnpm preview      # preview the build
pnpm lint         # eslint, zero warnings
pnpm format       # prettier --write
pnpm test         # vitest (unit + component)
pnpm test:e2e     # playwright
```

Husky: pre-commit runs Prettier + ESLint on staged files; pre-push runs type-check + unit tests. Conventional Commits (commitlint). Deployed on Netlify (`netlify.toml`); the build command runs the full quality gate.

## Definition of done

Lint clean (zero warnings), `tsc` clean, unit/component/e2e green (carry-over and cap especially), builds, **installs and runs offline**, keyboard-accessible, reduced-motion safe, and faithful to this design system — warm paper, Spectral serif, muted sage, **lots of whitespace**. The prototype (`Essentials.html` + `essentials-app.jsx`) is the source of truth for layout, copy, the cap mechanic, carry-over, and the calm states; port it faithfully. Above all: **it must feel like an exhale — spare, serene, uncluttered. When in doubt, remove something.**
