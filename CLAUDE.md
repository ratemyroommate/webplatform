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

### Routing & i18n

- **App Router with locale segment**: every page lives under `src/app/[locale]/…`. Locale comes from `next-intl` middleware; `defaultLocale: "hu"`, `localePrefix: "as-needed"`, `localeDetection: false`. See `src/i18n/routing.ts`.
- **Route group `(main)`**: `src/app/[locale]/(main)/` wraps everything that should render the global chrome (Navbar + footer). Pages outside the group — currently `signin/` — get no chrome. URL paths are unaffected by the group name.
- **Translations**: JSON catalogs at `messages/{en,hu}.json`. Server components use `getTranslations` from `next-intl/server`; client components use `useTranslations` from `next-intl`. Shared nav strings live under `common.*` (e.g. `common.backToFeed`).
- **Navigation**: always import `Link`, `useRouter`, `usePathname` from `~/i18n/navigation` — these are the locale-aware versions that prefix the URL correctly.

### Components (`src/app/_components/`)

App-specific reusable UI lives here. Built on top of shadcn primitives (`src/components/ui/`). Toast notifications via `sonner`. Dialog/Sheet from shadcn (`Dialog`, `Sheet`).

### Database models

Core entities: `User`, `Post`, `Review`, `Request`, `KvizAnswer`. Locations enum: `BUDAPEST`, `DEBRECEN`, `SZEGED`. Request statuses: `PENDING`, `ACCEPTED`, `DENIED`.

### Auth

NextAuth.js with Google provider only. **Custom sign-in page** at `src/app/[locale]/signin/page.tsx` — wired via `pages.signIn: "/signin"` in `src/server/auth.ts`. **One-click sign-out** from the avatar dropdown calls `signOut({ callbackUrl: "/" })` directly + a `sonner` toast; no NextAuth confirmation page is used.

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

- **Primary** `#58CC02` (Duolingo green) on **`--primary-foreground` #000000** (black text on green)
- **Background** `#F6F3EE` (warm off-white) — `--background`
- **Card** `#FFFCF7` — `--card`
- **Ink** `#1F1B16` (warm dark) — `--foreground`
- **Accent green** `#3F7A4E` (deeper green for success states) — `--accent-green-hex`
- **Star** `#E8A93C` — used for ratings
- **Danger** `#B84A3A` — `--destructive`
- **Radius** `--radius: 18px`

Derived alpha shades exposed as CSS vars: `--ink-05` through `--ink-80`, `--primary-05/-10/-15/-30`, `--accent-green-05`. Use these instead of hex literals to keep dark mode + future palette swaps consistent.

**`--primary-shadow`**: derived (`color-mix(in oklab, var(--primary) 75%, black)`) — single source of truth for the Duolingo-style offset drop shadow used by `Button[variant=chunky]` and `CtaBanner`. Never inline the `color-mix` call again; reference the token.

Dark mode (`.dark`) uses a warm dark base (`#1A1714` background, `#221E1A` card) with the same green primary. Ink shades flip to white-with-alpha.

### Typography

- **Plus Jakarta Sans** (400/500/600/700/800) via `next/font/google`, exposed as `--font-plus-jakarta` → `--font-sans`. Loaded once in `src/app/[locale]/layout.tsx`.
- Body defaults to `font-weight: 500`. Headings go 700–800. Tracking on display headings is `-0.02em` to `-0.025em`.
- `font-feature-settings: "ss01", "cv01", "cv11"` enabled in `body` for the Jakarta stylistic alternates.

### Design primitives (`src/components/ui/`)

The redesign's visual vocabulary lives as small shadcn-style primitives. Compose these instead of writing inline styles in routes:

| Primitive | Purpose |
|---|---|
| `logo.tsx` | The chunky lowercase `rmrm` wordmark + brand dot. `size` prop scales both; optional `accent` prop overrides the dot color (use when placing the logo on a primary background). |
| `button.tsx` | Standard shadcn Button + `chunky` variant (Duolingo-style offset shadow via `--primary-shadow`, primary fill, extrabold, pill-shaped). |
| `cta-banner.tsx` | Full-width primary banner with icon + title + subtitle + trailing arrow. Shares `--primary-shadow` with the chunky button. |
| `price-chip.tsx` | Floating white pill with bold price + small unit. Designed for absolute-positioning over a hero image. |
| `fresh-badge.tsx` | Primary chip with a pulsing dot for freshness flags ("NEW", "ÚJ"). |
| `open-spot-card.tsx` | Dashed primary-bordered card representing an unfilled roommate slot. |
| `profile-cover.tsx` | Primary-gradient banner with a soft radial overlay. Used at the top of profile cards. |
| `compat-ring.tsx` | Circular % indicator. Colors step at 70% (primary) and 85% (accent green). |
| `back-to-feed.tsx` | Muted bold "← Back to feed" link. Used as the top-of-page nav affordance on routes outside the main feed. Reads `common.backToFeed`. |
| `google-g.tsx` | Multi-color Google "G" logo SVG. Used on the sign-in CTA. |

When you build a new screen and find yourself reaching for `style={{ background: "var(--primary)", boxShadow: "..." }}`, check this folder first — there's probably already a primitive for it. If not, add one here rather than inlining.

### Key UI patterns

- **Navbar** (`src/app/_components/Navbar.tsx`) — sticky, `color-mix` translucent over `--background`, blurred. Logged-out: `<Logo>` + `LanguagePicker` + `<Button variant="chunky" size="sm">` login. Logged-in: `LanguagePicker` + bell + `<ProfileDropdown>`.
- **LanguagePicker** (`LanguagePicker.tsx`) — single-click pill (globe icon + uppercase locale code) that **cycles** through `SUPPORTED_LOCALES`. No dropdown; tap toggles EN ↔ HU (extends naturally to more locales).
- **ProfileDropdown** (`ProfileDropdown.tsx`) — 300px `rounded-2xl` dropdown with a soft drop shadow. Sections: header (48px avatar + name + email), clickable Profile-completeness card (progress bar + "N steps to a complete profile →"), nav items (Profile / My posts / Quiz with green check when done), sign-out at the bottom in a `border-t` section.
- **Footer** (`(main)/layout.tsx`) — light, top-bordered, centered: `<Logo size={20}>` + horizontal nav (Contact · Privacy · Terms) + © line. No dark block, no logo image.
- **Sign-in page** (`signin/page.tsx`) — full-bleed (outside the `(main)` route group, so no nav/footer). Split layout: form left, decorative primary panel right with stats + testimonial cards. The Google CTA is a one-off dark-ink button using the design's ink-shadow recipe; not part of the chunky variant.
- **Back-to-feed link** — top-of-page on routes outside the feed (signin, profile, user posts, quiz, quiz answers). Always `<BackToFeed />` from `~/components/ui/back-to-feed.tsx`.
- **Feed filter chip bar** (`FilterChipBar.tsx`) — Airbnb-style icon-over-label chips with an underline indicator. Maps to `Location` enum.
- **Filter Sheet** (`Filters.tsx`) — design-spec right Sheet (420px). Uppercase tracked labels via the local `Field` helper. Selection groups (roommates / gender / sort) use the local `Segmented<V>` helper — pill grid with `--foreground` background on the active option. Sticky `border-t` footer with Reset + Apply.
- **PostModal** (`PostModal.tsx`) — Dialog (600px, `rounded-2xl`). Helpers: `Field`, `StepperField` (compact `±` pill stepper), `ImageDropzone` (dashed border + primary-tinted icon disc + hidden file input), `ResidentToggle` (pill-card with shadcn Checkbox). Rent + headcount steppers sit side-by-side; Where/Age/Gender on a 3-col grid.
- **Compatibility quiz** (`Kviz.tsx`) — `max-w-3xl` page chrome. Segmented progress bar + percentage overline. Question lives in a `rounded-2xl bg-card` card. Answer options are custom buttons (no shadcn `RadioGroup`/`Label`): selected → `border-primary bg-primary-05` with a primary-filled check disc. Submit uses the chunky variant. `CompletedKviz.tsx` reuses the same option style read-only.
- **Fresh-today strip** (`FreshTodayStrip.tsx`) — horizontal portrait thumbnails for posts < 4 days old. Falls back to nothing if no fresh posts.
- **PostCard** (`post.tsx`) — tall portrait (`3/4` aspect), photo dominates, big white **price chip** bottom-right, optional `NEW` chip top-left, roommate avatars + free-spots below.
- **Chunky CTA buttons** — extrabold text, primary background, `0 4px 0 var(--primary-shadow)` offset shadow giving a "tappable" Duolingo feel. Reach for `<Button variant="chunky">` or `<CtaBanner>` instead of inlining.
- **Post detail** (`/posts/[id]`) — split gallery (1 hero + 2 stacked, with rounded outer corners) → two-column body: left = title/meta/roommates grid/description/compatibility; right = sticky booking card with big tabular price, host card, apply CTA. Roommates grid includes dashed "Open spot" cards for `freeSpots`.
- **Profile** (`/users/[id]`) — `<BackToFeed>` at top, then a gradient cover banner over a 104px circular avatar (`relative z-10` so it sits above the cover), 40px extrabold name, then rating + contact links + about text. `ProfileCompleteness` only renders for the owner.

### What the design wants but the app doesn't have yet

See `Tasks.md` in the repo root. Common gaps: save/wishlist, "Hot" sort, verified-ID badge, amenities schema, per-category compatibility breakdown, host messaging, profile stat counters.
