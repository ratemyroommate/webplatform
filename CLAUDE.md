# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier (writes in place)
npm run db:generate  # Generate Prisma client + run migrations
npm run db:push      # Push schema without migration (dev only)
npm run db:studio    # Open Prisma Studio GUI
```

No test suite is configured.

## Stack

**T3 Stack** — Next.js 14 (App Router) + tRPC + Prisma + NextAuth + Tailwind CSS

| Layer | Technology |
|---|---|
| Frontend | React 18, Next.js App Router, TypeScript (strict) |
| API | tRPC v11 (all backend operations go through tRPC) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js 4, Google OAuth only |
| Styling | Tailwind CSS 4 + shadcn/ui (radix primitives) |
| Forms | React Hook Form 7 + Zod validation |
| File uploads | Uploadthing (max 4 files, 4 MB each) |
| Server state | React Query 5 (via tRPC hooks) |

Path alias: `~/` maps to `./src/`

## Architecture

### tRPC routers (`src/server/api/routers/`)

All data operations are tRPC procedures. Domain routers: `post`, `user`, `review`, `request`, `kviz`. They are composed in `src/server/api/root.ts`.

Two procedure types:
- `publicProcedure` — no auth required
- `protectedProcedure` — requires session; throws UNAUTHORIZED otherwise

### Data flow

Server Components fetch data via `src/trpc/server.ts` helpers and pass it to `<HydrateClient>` for hydration. Client Components use `api.router.procedure.useQuery()` / `.useMutation()` hooks.

### Components (`src/app/_components/`)

All reusable UI lives here. Built on top of shadcn primitives (`src/components/ui/`). Toast notifications via `sonner`. Dialog/Sheet from shadcn (`Dialog`, `Sheet`).

### Database models

Core entities: `User`, `Post`, `Review`, `Request`, `KvizAnswer`. Locations enum: `BUDAPEST`, `DEBRECEN`, `SZEGED`. Request statuses: `PENDING`, `ACCEPTED`, `DENIED`.

### Environment variables

See `.env.example`. Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## Key conventions

- **No Redux** — React Query handles all server state; local `useState` for UI state
- **Zod everywhere** — input schemas defined in tRPC routers; reused with React Hook Form via `zodResolver`
- **SuperJSON** — used as tRPC transformer; handles Date serialization automatically
- **Image uploads** — compress client-side (`src/utils/imagecompression.ts`) before sending to Uploadthing
- **`noUncheckedIndexedAccess`** is enabled — array/object access returns `T | undefined`

## Design system

Redesign landed May 2026 via Claude Design. Source bundle (HTML/CSS/JSX prototype) lives outside the repo; this section is the canonical reference.

### Tokens (`src/styles/globals.css`)

- **Primary** `#58CC02` (Duolingo green) on **`--primary-foreground` #FFFFFF**
- **Background** `#F6F3EE` (warm off-white) — `--background`
- **Card** `#FFFCF7` — `--card`
- **Ink** `#1F1B16` (warm dark) — `--foreground`
- **Accent green** `#3F7A4E` (deeper green for success states) — `--accent-green-hex`
- **Star** `#E8A93C` — used for ratings
- **Danger** `#B84A3A` — `--destructive`
- **Radius** `--radius: 18px`

Derived alpha shades exposed as CSS vars: `--ink-05` through `--ink-80`, `--primary-05/-10/-15/-30`, `--accent-green-05`. Use these instead of hex literals to keep dark mode + future palette swaps consistent.

Dark mode (`.dark`) uses a warm dark base (`#1A1714` background, `#221E1A` card) with the same green primary. Ink shades flip to white-with-alpha.

### Typography

- **Plus Jakarta Sans** (400/500/600/700/800) via `next/font/google`, exposed as `--font-plus-jakarta` → `--font-sans`. Loaded once in `src/app/[locale]/layout.tsx`.
- Body defaults to `font-weight: 500`. Headings go 700–800. Tracking on display headings is `-0.02em` to `-0.025em`.
- `font-feature-settings: "ss01", "cv01", "cv11"` enabled in `body` for the Jakarta stylistic alternates.

### Design primitives (`src/components/ui/`)

The redesign's visual vocabulary lives as small shadcn-style primitives. Compose these instead of writing inline styles in routes:

| Primitive | Purpose |
|---|---|
| `logo.tsx` | The chunky lowercase `rmrm` wordmark + brand dot. `size` prop scales both. |
| `button.tsx` | Standard shadcn Button + new `chunky` variant (Duolingo-style offset shadow, primary fill, extrabold, pill-shaped). |
| `cta-banner.tsx` | Full-width primary banner with icon + title + subtitle + trailing arrow. Same chunky shadow as the button variant. Used for top-level screen CTAs. |
| `price-chip.tsx` | Floating white pill with bold price + small unit. Designed for absolute-positioning over a hero image. |
| `fresh-badge.tsx` | Primary chip with a pulsing dot for freshness flags ("NEW", "ÚJ"). |
| `open-spot-card.tsx` | Dashed primary-bordered card representing an unfilled roommate slot. |
| `profile-cover.tsx` | Primary-gradient banner with a soft radial overlay. Used at the top of profile cards. |
| `compat-ring.tsx` | Circular % indicator. Colors step at 70% (primary) and 85% (accent green). |

When you build a new screen and find yourself reaching for `style={{ background: "var(--primary)", boxShadow: "..." }}`, check this folder first — there's probably already a primitive for it. If not, add one here rather than inlining.

### Key UI patterns

- **Navbar** (`src/app/_components/Navbar.tsx`) — sticky, `color-mix` translucent over `--background`, blurred. Uses `<Logo>` + `<Button variant="chunky" size="sm">` for the login button.
- **Feed filter chip bar** (`FilterChipBar.tsx`) — Airbnb-style icon-over-label chips with an underline indicator. Maps to `Location` enum.
- **Fresh-today strip** (`FreshTodayStrip.tsx`) — horizontal portrait thumbnails for posts < 4 days old. Falls back to nothing if no fresh posts.
- **PostCard** (`post.tsx`) — tall portrait (`3/4` aspect), photo dominates, big white **price chip** bottom-right, optional `NEW` chip top-left, roommate avatars + free-spots below.
- **Chunky CTA buttons** — extrabold text, primary background, `0 4px 0 darken(primary)` offset shadow giving a "tappable" Duolingo feel. Reusable via inline style; see Feed's "New post" CTA and Navbar's login button.
- **Post detail** (`/posts/[id]`) — split gallery (1 hero + 2 stacked, with rounded outer corners) → two-column body: left = title/meta/roommates grid/description/compatibility; right = sticky booking card with big tabular price, host card, apply CTA. Roommates grid includes dashed "Open spot" cards for `freeSpots`.
- **Profile** (`/users/[id]`) — gradient cover banner over a 104px circular avatar, 40px extrabold name, then rating + contact links + about text. `ProfileCompleteness` only renders for the owner.

### What the design wants but the app doesn't have yet

See `Tasks.md` in the repo root. Common gaps: save/wishlist, "Hot" sort, verified-ID badge, amenities schema, per-category compatibility breakdown, host messaging, profile stat counters.
