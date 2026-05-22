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

**Status:** ✅ Shipped. `post.getFresh` returns up to `FRESH_MAX` (12) posts created within `FRESH_WINDOW_DAYS` (4), both constants server-side so they can't be tampered with from the browser. `FreshTodayStrip` calls it with no args.

---

## Notifications: badge count

**Status:** `NotificationModal` exists with a bell icon. The redesign's mockup shows a numeric badge ("3" pill on the bell).

**What's missing:** A query that returns the count of _unread_ incoming requests for the current user.

**Smallest viable change:** Add `request.getUnreadCount`, render a small primary-colored badge on the bell trigger inside `NotificationModal.tsx`.

---

## Shareable compatibility quiz (growth lever)

**Why:** The quiz is the product's actual differentiator — no other Hungarian roommate site has it. Today it's locked behind sign-in, which means it can't go viral. Treat it like a BuzzFeed-style personality quiz: anyone can take it, and the result is something people _want_ to share with friends.

**What's missing:**

- `Kviz.tsx` redirects to sign-in if no session; quiz answers persist only on `CompatibilityAnswer` which requires `createdById`.
- No result page that works standalone — the "completed quiz" view assumes a logged-in user with their own answers.
- No share metadata (OG image, summary copy) for a quiz result.

**Smallest viable change:**

1. Allow `/kviz` to render for anonymous visitors. Store anonymous answers in `sessionStorage` or a short-lived signed cookie keyed by a UUID.
2. On submit, compute a lightweight "housemate type" summary (e.g. "Tidy early bird", "Easygoing social butterfly") from the answers — no per-user compatibility math, just a categorization. New route `/kviz/r/[resultId]` that takes a signed/serialized result and renders the summary publicly.
3. When the user signs in later, migrate the anonymous answers into `CompatibilityAnswer` rows (one-time upsert).
4. Add `opengraph-image.tsx` for the result route with the housemate-type label baked into the image — that's the share artifact.
5. "Share with a friend" CTA at the end of the quiz: copy link + native share. Gentle nudge to sign up to "see who matches you".

**Bonus:** Track which result types convert best — feeds back into onboarding copy.

---

## Shareable profile (growth lever)

**Why:** Posts already have shareable URLs and (will have) good OG images. Profiles don't, which means when users link their `rmrm.hu/users/abc123` in a Facebook group or DM, the preview is generic — nobody clicks. The profile is the natural artifact to share: "Hi, I'm looking for housemates, here's my profile + quiz."

**What's missing:**

- No `opengraph-image.tsx` or `metadata` for `/users/[id]` — Next.js falls back to the global OG image.
- No public-facing "share my profile" button on the profile page.
- Profile page may render owner-only sections (e.g. ProfileCompleteness) without a viewer-mode check — verify before exposing the URL publicly.

**Smallest viable change:**

1. Add `opengraph-image.tsx` at `src/app/[locale]/(main)/users/[id]/opengraph-image.tsx` rendering avatar + name + location + rating + "I'm looking for a roommate" overline.
2. Add `generateMetadata` on the profile page setting `openGraph`, `twitter`, and a localized title/description.
3. Add a "Share profile" button (icon + native share API + clipboard fallback) on the profile page, visible to the owner only.
4. Audit `users/[id]/page.tsx` to confirm no logged-in-only data leaks when viewed by anonymous users (phone number especially — the recent migration added it).
5. Consider a vanity slug (`/u/[handle]`) later — `cuid()` URLs are share-hostile.

**Bonus:** Same OG treatment applied to `/users/[id]/posts` — sharing your listings page should also preview nicely.
