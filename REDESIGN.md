# REDESIGN.md

Gap analysis between the Claude Design handoff bundle (`RMRM Redesign.html` +
`chrome.jsx`, `feed.jsx`, `post-detail.jsx`, `screens.jsx`, `data.js`) and the
current `webplatform` codebase. The bundle was produced **after** the Duolingo-green
redesign described in `CLAUDE.md` and supersedes it — the design assistant landed on
a terracotta-on-warm-cream palette and a richer feature set than what is shipped.

Each item below has: **What the design shows → What we have → Steps to close the gap**.

---

## 0. Palette — intentionally diverges from the design bundle

The Claude Design bundle uses terracotta `#D97757` as `--primary`. **We intentionally keep Duolingo green `#58CC02`** as our brand primary — the terracotta was an exploration we decided against. Everything else in the design's token list (`--bg`, `--card`, `--ink`, `--accent-green`, `--star`, `--danger`, `--radius: 18px`) already matches.

**Minor housekeeping that's still worth doing:**

1. Add a `--primary-shadow: color-mix(in oklab, var(--primary) 75%, black)` CSS var in `globals.css` so `CtaBanner` and `Button[variant=chunky]` can reference it instead of inlining the `color-mix` call (§13).
2. Add a `--avatar-me: var(--primary)` token if/when we adopt the self-avatar pattern from the design.
3. When implementing primary-tinted surfaces from the design (e.g. the open-spot card, the "Verify ID" icon chip), use our existing `--primary-05/-10/-15/-30` shades — they're already green-derived and consistent.
4. Where the design uses primary for things that read as "warm/inviting" (the welcome hero overline `--primary` text, the dark kviz card's puzzle icon chip background), green will read differently — sanity-check the contrast/feel as those components land; substitute `--accent-green` if green-on-green clashes.

---

## 1. Navbar / Header (`chrome.jsx` Header, lines 186-249)

| Aspect | Design | Current (`Navbar.tsx`) |
|---|---|---|
| Center nav links | `Discover · Saved · Matches · Help` pills (`md:flex`) with badge for Saved count | none |
| Language switcher | Globe icon + locale code, pill with `--card` bg | ✅ matches after recent fix |
| Bell | Circular `h-9 w-9` `--card` pill with primary badge ring | ✅ matches after recent fix |
| Avatar dropdown | Profile-completeness progress bar inside the dropdown + `My profile / My posts / Saved (badge) / Compatibility quiz (✓) / Settings / Log out` | Only `Profile / Quiz / My posts / Sign out` |

**Steps**
1. Add a center `<nav>` between Logo and the action cluster with `Discover / Saved / Matches / Help` (hidden under `md`). Routes don't all exist yet — wire the ones that do (`/`, `/users/[id]/posts`, future `/matches`, future `/help` or `/contact`). Hide unimplemented items behind a feature flag rather than 404-ing.
2. Extend the avatar `DropdownMenu` in `Navbar.tsx:34-73`:
   - Top section: 48px avatar + name + email row (lifted from `ProfileDropdown` in `chrome.jsx:259-269`).
   - Profile-completeness progress bar (reuse `ProfileCompleteness.tsx` data; render as a 1.5px progress + `n steps to a verified profile →`).
   - Add `Saved` and `Settings` menu items; badges from real counts where available.
3. Saved count: ties into the missing wishlist feature (see §8).

---

## 2. Feed page (`feed.jsx` FeedScreen, lines 278-412)

### 2a. Hero/welcome strip (lines 304-324)

| Design | Current |
|---|---|
| `Hey, {firstName}` overline + 32px "Find your match, not just a flat." headline + a small `12 new today` stat card on the right | none |

**Steps**
1. New component `WelcomeHero.tsx` in `_components/` — server component that takes `session.user.name` and a "new today" count (derive from `getLatest` first page filtered by `postedDaysAgo < 1`).
2. Render at top of `Feed.tsx` above `FreshTodayStrip`.

### 2b. Filter chip bar (lines 222-276)

| Design | Current `FilterChipBar.tsx` |
|---|---|
| 11 chips: All, Top 🔥, Budapest, Buda side, Pest side, Cozy, Balcony, Pets-ok, Studio, Garden, Verified | 4 chips: All, BUDAPEST, DEBRECEN, SZEGED |

**Steps**
1. The current implementation maps 1:1 to the `Location` Prisma enum. Design chips are *facets*, not locations. Two-tier model:
   - Keep `Location` chips as a separate row (or behind a Location dropdown), OR collapse Debrecen/Szeged into the Location filter sheet and use the top row purely for facets.
2. New chip facets need backing data:
   - `Top 🔥` — sort by request count or compatibility (already conceptually exists; just expose).
   - `Buda side` / `Pest side` — district mapping; needs a small Budapest-district→side table in `src/utils/`.
   - `Cozy / Balcony / Pets-ok / Studio / Garden` — **amenities**, which the schema doesn't have. See §9.
   - `Verified` — needs ID verification flag on `User`. See §10.

### 2c. Sticky filter bar — sort dropdown + Filters button (lines 330-358)

| Design | Current |
|---|---|
| Sort `select` pill with `Hot 🔥 / Newest / Match % / Price ↑ / Price ↓` + Filters pill with primary count badge `3` | Only a `Filters` icon button (`Filters.tsx`) — no sort, no count badge |

**Steps**
1. Add a sort `Select` (shadcn `select.tsx`) to `Feed.tsx`'s sticky bar with the five options. Wire to `post.getLatest`'s `orderBy` — the router already takes filters; extend it with `sort`.
2. Show an active-filter-count badge on the existing `Filters` trigger when `filters` has any non-default values. Reuse `FiltersIndicator.tsx`.

### 2d. "New post" CTA (lines 361-381)

✅ Matches `CtaBanner`. Spacing: design places it *after* the chip bar but *before* the grid; we render it correctly.

### 2e. Post card (`feed.jsx` PostCard, lines 4-175)

| Design | Current `post.tsx` |
|---|---|
| Top-left chip cluster: NEW badge + compatibility % chip (white pill, primary text < 85, accent-green ≥ 85) | Only NEW (`FreshBadge`) |
| Top-right save (heart) button — floating white circular | none |
| Bottom-right price chip (✅ matches) | ✅ |
| Image dots indicator for galleries with >1 image | none |
| Below image: neighborhood + city ("Belváros, Budapest"), title subtitle, host rating star + tabular | We show only `te(post.location)` + description |
| Roommate row: avatars + `{free} free · {total} total` | We show `{free} / {total}` (no labels) |

**Steps**
1. Add `<CompatibilityChip>` overlay (new `components/ui/compat-chip.tsx`) and render top-left under `FreshBadge`. Requires viewer→post compatibility score — compute on the server with `CompatibilityScore`'s logic, hydrate into the feed query, or expose a `viewerCompatibility` field on the post DTO.
2. Add save button: needs Wishlist model (§8). Until then, scaffold as a non-functional button hidden behind a flag.
3. Add image-dot indicator overlay (purely client state if we make the image swipeable; otherwise just a static dot row showing image count).
4. Update the title row: `{neighborhood}, {te(post.location)}`. We don't have a `neighborhood` column — add as optional string on `Post` (see §11), fall back to title.
5. Update roommate counter copy to use `{free} free · {total} total` (i18n: `feed.spotsFree` / `feed.spotsTotal`).

### 2f. Fresh-today strip (lines 178-219)

| Design | Current `FreshTodayStrip.tsx` |
|---|---|
| Title row has a `See all →` link on the right | none |
| Card overlay shows `XX% match` overline + neighborhood + price | We show location + price, no compat % |

**Steps**
1. Add `See all →` button that filters the feed by `postedDaysAgo < 4`.
2. Add compat % to the card overlay once §2e.1 ships.

### 2g. End-of-feed state (lines 401-409)

| Design | Current |
|---|---|
| Centered green-circle check + "You're all caught up." + "Expand search radius →" | none |

**Steps** — render after `FeedPosts` when `hasNextPage === false`.

---

## 3. Post detail (`post-detail.jsx`, full file)

| Aspect | Design | Current `/posts/[id]` |
|---|---|---|
| Top utility bar: Back link + Save / Share / `…` more pills | We have nothing equivalent (just the header) |
| Gallery: 1 hero + 2 stacked thumbnails with `+N photos` chip on the last one when there are >3 images | Already in `PostGallery.tsx` — verify the rounded-corner pattern matches (`rounded-l-3xl` + `md:rounded-r-none` etc.) |
| Title row: `BELVÁROS · BUDAPEST` overline (uppercase, tracked) + 28-40px title | Likely only title |
| Meta row: `users / bed-double / user / venetian-mask` icons with counts | Partial |
| Roommate grid cards: bordered, avatar 48px, name, star + rating, `HOST` chip for advertiser | Likely simpler |
| Open-spot card: dashed primary border, `+` icon, "Open spot / Could be you" | ✅ `OpenSpotCard` exists; verify copy |
| Amenities section (icon + label grid) | none |
| Compatibility breakdown (4 bars: Lifestyle / Schedule / Cleanliness / Sociability) | We have a single `CompatibilityScore` |
| Sticky right-rail booking card: 44px price + Apply + Message + "Applying is free and non-binding" | We have a `RequestModal` but probably not the sticky-right layout |
| Report link (subtle, bottom-right) | none |

**Steps**
1. Re-architect the post detail page as a 12-column grid with `lg:col-span-8` left content + `lg:col-span-4` `sticky top-[88px]` aside.
2. Build the utility bar (Back / Save / Share / More) — Save needs §8, Share via `navigator.share`, More into a dropdown with `Report`.
3. Overline + meta-row need: `neighborhood` (§11), `bedrooms` (new column or derived from `maxPersonCount`), `ageGroup` (already on schema?), `gender`. Add what's missing.
4. New `Amenities` component — needs amenities schema (§9). Map keys to lucide icons per `post-detail.jsx:25-36`.
5. New `CompatibilityBreakdown` component — needs per-category sub-scores from the kviz answers; today `CompatibilityScore` only produces a single number. Extend `kviz` router with `getBreakdown`.
6. Sticky booking card: lift price + host card + Apply + Message into a dedicated component. Message functionality is §12.
7. Roommate card: build `RoommateCard.tsx` matching `post-detail.jsx:153-165`. `HOST` chip uses `--primary-10` background, `--primary` text.

---

## 4. Profile (`screens.jsx` ProfileScreen, lines 5-218)

| Aspect | Design | Current `/users/[id]/page.tsx` |
|---|---|---|
| Cover gradient banner | ✅ `ProfileCover` exists | ✅ |
| 104px avatar with `--bg` ring | ✅ | ✅ (z-index fix already applied) |
| Top action: `Edit profile` button only for owner | ✅ `EditProfile` | ✅ |
| Meta row under name: `MapPin Budapest · Briefcase Software engineer · Calendar Joined 2025` | none |
| Stats grid (3 cards): My posts / Saved / Applications, each with count + uppercase label + icon | none |
| Completeness card (left, 7-col): list of items with green-circle check or grey alert circle + `Add →` link | We have `ProfileCompleteness.tsx`; verify layout/style |
| Compatibility quiz card (right, 5-col): **dark gradient card** (ink → ink-80), primary puzzle icon chip, big heading, `6/6 completed`, `Review →` pill | We have `CompletedKviz.tsx` but not styled as a dark card |
| Verify-ID card (under quiz card): primary-tinted icon chip + "Verify your ID / Takes one minute" + `→` | none |
| `My posts` section grid (2 cols on `sm:`) of `PostCard` with `showCompat={false}` | Partial |

**Steps**
1. Add bio/location/occupation/joined-date row from existing `User` fields where available, add columns where not (occupation is missing today).
2. Build `ProfileStats.tsx` — three counter cards. `My posts` = `post.count`, `Saved` = §8, `Applications` = count of user's requests.
3. Restyle `ProfileCompleteness.tsx` to match the checklist pattern (lines 121-145): per-item rounded pills, green for done, neutral for pending, `Add →` action.
4. Build `KvizPromoCard.tsx` (dark gradient variant) replacing the current `CompletedKviz` visual.
5. Build `VerifyIdCard.tsx` — placeholder UI; the verification flow itself is §10.
6. Switch `My posts` grid to use the redesigned `PostCard` with `showCompat={false}`.

---

## 5. Filter sheet (`screens.jsx` FilterSheet, lines 223-end)

| Aspect | Design | Current `Filters.tsx` |
|---|---|---|
| Roommate count: 4-button grid `2 / 3 / 4 / 5` | We have a number control |
| Max price: custom range slider with primary fill + thumb circle + `50k–500k` tick line | Slider exists; verify visual matches |
| Location: a row of `Pill`s | Possibly a `Select` |
| Age range: pill row | Possibly missing |
| Gender preference: pill row | We have male/female/both |
| Sort by: 4 pills with trending-up/down icons (Price ↑/↓, Date ↑/↓) | We don't have inline sort here (handled in feed sticky bar in §2c) |
| Reset + Apply at footer | ✅ |

**Steps**
1. Replace numeric inputs with the pill-grid pattern; reuse shadcn `ToggleGroup` for single-select rows.
2. Restyle the slider to match (custom track + thumb) — likely a one-off in `Filters.tsx` or extend `components/ui/slider.tsx` with a `chunky` variant.
3. Add Age range if it's not there.
4. Drop the sort row from the sheet if §2c added it to the sticky bar; otherwise mirror.

---

## 6. Notifications panel (referenced in `chrome.jsx` Header, separate panel in `screens.jsx`)

The design has a full notifications stream (matches / messages / reviews / new posts), not just incoming requests. Current `NotificationModal` is request-only.

**Steps**
1. Add a `Notification` model: `{ id, userId, type: enum, payload jsonb, readAt, createdAt }`.
2. tRPC `notification` router: `list`, `markRead`, `markAllRead`.
3. Rewrite `NotificationModal.tsx` body to render a unified stream, with tabs `All / Unread / Mentions` (design uses a single list; tabs are nice-to-have).
4. Keep the request approve/deny actions as an inline action on `match`-type rows.

---

## 7. Open-spot card

✅ `components/ui/open-spot-card.tsx` exists. Verify the copy is "Open spot / Could be you" (or HU equivalent) and the icon is a primary-tinted plus.

---

## 8. Wishlist / Saved (recurring dependency)

Saved/heart button appears on: navbar (count badge), post card, post detail utility bar, profile stats, dropdown menu.

**Steps**
1. Prisma: `Wishlist { id, userId, postId, createdAt @@unique([userId, postId]) }`.
2. tRPC `wishlist` router: `toggle(postId)`, `list`, `count`.
3. Hook into the components above. Optimistic update on toggle.

---

## 9. Amenities schema (recurring dependency)

Used by filter chips (§2b), post detail amenities section (§3.4), filter sheet (potentially).

**Steps**
1. Prisma: `enum Amenity { WIFI WASHER BALCONY PETS_OK ELEVATOR FURNISHED AC GYM GARDEN PARKING STUDIO }`, then `amenities Amenity[]` on `Post`.
2. Backfill existing posts (script: best-effort from description string match, or leave empty).
3. Update `post.create` / `post.update` tRPC inputs to accept amenities.
4. Add amenity multi-select to the post form (`PostModal.tsx`).

---

## 10. ID verification (recurring dependency)

Used by host card check icon (§3.7), profile Verify-ID card (§4.5), `Verified` filter chip (§2b).

**Steps**
1. Prisma: `User.idVerifiedAt DateTime?`.
2. Stub a `verifyIdentity` tRPC mutation (placeholder until a real KYC provider lands).
3. `verified` filter: `where: { user: { idVerifiedAt: { not: null } } }`.

---

## 11. Post fields gap

| Field needed by design | Have? | Action |
|---|---|---|
| `neighborhood: string` | no | Add nullable column; show in card + detail |
| `ageGroup: string` ("22–28", "Any") | check | Add if missing; the design treats it as a meta chip |
| `gender: string` ("Male & Female") | yes (preference filter) | Reuse |
| `currency` | implicit HUF | Keep; just confirm copy |

---

## 12. Host messaging (post detail aside)

Design has a `Message host` outline button next to `Apply to live here`. Today we have only `RequestModal` (apply flow).

**Steps**
1. Prisma: `Message { id, threadId, fromUserId, toUserId, body, createdAt, readAt }` + `MessageThread { id, postId?, participants[] }`.
2. tRPC `message` router.
3. New `/messages` route + thread UI. Out of scope for the visual redesign; track as a separate epic.

---

## 13. CTA-banner / chunky button tweaks

Design's "New post" CTA (lines 364-381) uses
`boxShadow: 0 1px 0 rgba(0,0,0,.08), 0 4px 0 var(--primary-shadow)`.
Current `CtaBanner` uses `color-mix(in oklab, var(--primary) 75%, black)` inline.
**Step**: extract `--primary-shadow` as a CSS variable in `globals.css` and reuse
across `CtaBanner` + `Button[variant=chunky]` for consistency and theme-ability.

---

## Suggested execution order

1. **§0** add `--primary-shadow` token (small CSS-only housekeeping; no visual regression).
2. **§1** navbar dropdown enrichment (already partly done).
3. **§8** Wishlist schema + tRPC (unblocks card save button + dropdown count + profile stat).
4. **§11** Post field additions (`neighborhood`) — unblocks PostCard + detail.
5. **§2e** PostCard redesign with compat chip + save button + neighborhood.
6. **§2c, §2b, §2a** Feed sticky bar, chip facets, welcome hero.
7. **§3** Post detail redesign + **§9** Amenities + **§10** ID verification stub.
8. **§4** Profile redesign (stats, dark kviz card, verify-id card).
9. **§5** Filter sheet polish.
10. **§6** Notifications stream rewrite.
11. **§12** Host messaging — separate epic.

## Out-of-scope notes

- The design's `tweaks-panel.jsx` is a dev-only preview switcher (density,
  card layout, language). Not for production.
- Localization: design ships HU + EN strings inline; our app already uses
  `next-intl` — add keys to `messages/en.json` and `messages/hu.json` as new
  surfaces ship.
- Don't lift the design's *internal structure* verbatim (it's a vanilla
  React prototype); recreate visually in our Next.js + shadcn primitives.
  Most chrome primitives already exist under `src/components/ui/`.
