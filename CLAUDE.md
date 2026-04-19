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
| Styling | Tailwind CSS 4 + DaisyUI 5 |
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

All reusable UI lives here (~27 components). Modals use DaisyUI's modal system (controlled via HTML element `.showModal()` / `.close()`). Toast notifications via `react-hot-toast`.

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
