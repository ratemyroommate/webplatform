# Tasks

Features the design (Claude Design redesign, May 2026) calls for but the app doesn't have yet. Tracked here so the redesign can be applied incrementally without inventing fake UI for nonexistent backend.

Each item lists what's missing, what the design wants, and the smallest change to ship it.

---

## Save / wishlist 

**What the design shows:** Heart icon top-right of every post card, "Saved" counter in the header nav (`Saved 12`), "Saved" stat tile on the profile page, "Saved" item in the avatar dropdown with a badge count.

**What's missing:** No `SavedPost` table, no `post.save` / `post.unsave` tRPC procedures, no `post.getSaved` for the user.

**Smallest viable change:**
1. Add `model SavedPost { userId String; postId Int; createdAt DateTime @default(now()); @@id([userId, postId]) }` to `prisma/schema.prisma` and relate to `User` and `Post`.
2. Add `post.toggleSave`, `post.getSavedIds` (returns `Set<number>` for current user) and `post.getSavedFeed` to `src/server/api/routers/post.ts`.
3. Surface heart on `post.tsx` (already designed in the redesign source — currently omitted), nav counter via a `useSavedCount` hook.

---

## "Hot" / leaderboard sort

**What the design shows:** A `Hot 🔥` option in the sort dropdown above the feed, plus a "Top 🔥" chip in the filter chip bar.

**What's missing:** No engagement signal — no view counts, no save counts, no application counts surfaced as an aggregate.

**Smallest viable change:** Tie "Hot" to `requests.count + savedBy.count` over the last 7 days. Requires the SavedPost model above + a denormalized `Post.hotScore` (computed nightly) or a Prisma aggregation in `post.getLatest` when `orderBy === "hot"`.


---

## Amenities

**What the design shows:** A grid of amenity rows on the post detail page — Wi-Fi, Washer, Balcony, Pets OK, Elevator, Furnished, AC, Building gym, Garden, Parking.

**What's missing:** No `amenities` column on `Post`, no input on the post creation form.

**Smallest viable change:**
1. `model Post { amenities String[] }` (Postgres array of enum-like strings).
2. Multi-select checkbox group in `PostModal.tsx` mapped to the same 10 keys the design uses (`wifi`, `washer`, …). Add corresponding entries under `messages/{hu,en}.json:enums.amenity`.
3. Render the grid on post detail (the redesign code is ready — currently skipped).

---

## Per-category compatibility breakdown

**What the design shows:** Four progress bars on the post detail page — Lifestyle, Schedule, Cleanliness, Sociability — each with its own percentage.

**What's missing:** Today's compatibility is a single aggregate percentage from `CompatibilityScore`. Quiz answers exist per question (`CompatibilityAnswer`) but no per-category aggregation.

**Smallest viable change:**
1. Add `category` field to `CompatibilityQuestion` (enum: `LIFESTYLE | SCHEDULE | CLEANLINESS | SOCIABILITY`).
2. Backfill existing questions with categories.
3. New tRPC `user.getCompatibilityBreakdown` that computes percentage per category.
4. Render the four bars on post detail (component shape spec'd in the redesign source).

---


## Profile stats: posts / applications counters

**What the design shows:** A 3-column stat grid on the profile (`My posts`, `Saved`, `Applications` sent) with big tabular numerals.

**What's missing:** No batched count endpoint. `post.getAllByUserId` exists but loads full post rows; no equivalent for requests sent. Saved depends on the SavedPost model above.

**Smallest viable change:** Add `user.getStats` returning `{ postCount, applicationCount, savedCount }` for the logged-in user (or any user with privacy considerations). Then surface the grid above the profile completeness card.

---

## "Fresh today" — better data

**Status:** Implemented opportunistically — currently filters the first page of `getLatest` (only 2 posts per page!) for items created < 4 days ago.

**Improvement:** Add `post.getFresh` returning the N most recent posts in a single query. The strip currently misses anything beyond the first 2 results.

---


## Notifications: badge count

**Status:** `NotificationModal` exists with a bell icon. The redesign's mockup shows a numeric badge ("3" pill on the bell).

**What's missing:** A query that returns the count of *unread* incoming requests for the current user.

**Smallest viable change:** Add `request.getUnreadCount`, render a small primary-colored badge on the bell trigger inside `NotificationModal.tsx`.
