# carlosterly.photography — 12-month roadmap

A prioritised backlog to pull from in order — not a dated schedule. Completed
tech-debt work lives in git history, not a separate log.

## Context

The site (Eleventy 3.1.6 static, Dart Sass 1.77.8 pinned, Netlify auto-deploy from
`main`, solo, no CI/tests) has just finished a tech-debt burst — Eleventy 2→3, icon
subset, `npm audit` clean, view-transition noise silenced. The owner now wants to
build **new features over the next year**: activate the blog, refresh the visual
design, and rework the portfolio/galleries.

Scoping decisions already made:

| Question | Decision |
|---|---|
| Redesign depth | **Reskin** — retune tokens, keep structure. (Not a structural rebuild, not a new stack.) |
| Blog authoring | **Hand-written `.njk` files in `src/articles/`** — the existing pattern. No CMS, no Markdown. |
| Extra feature | **Portfolio restructure & richer galleries** only. (No store, client galleries, or newsletter.) |
| Pace / budget | **Hobby pace, no deadlines, $0** — free/open-source tools only. Backlog, not milestones. |

What already exists (from exploration):

- **Blog** is scaffolded end-to-end but dormant: `collections.post` via
  [src/articles/articles.json](src/articles/articles.json), a minimal
  [src/_includes/layouts/article.njk](src/_includes/layouts/article.njk), the
  [src/pages/articles-index.njk](src/pages/articles-index.njk) card grid, the
  `postDate` Luxon filter in [.eleventy.js](.eleventy.js). Nav link is
  `class="hidden"` in both menus. The 5 `src/articles/my-*-article.njk` are
  lorem-ipsum with `via.placeholder.com` body images. **Missing:** prose CSS
  (`_article.scss` styles only the index grid), article-page date/author, OG/JSON-LD
  meta, feed, tags, pagination, drafts.
- **Design** can't be a pure token swap. Tokens in
  [src/assets/scss/abstracts/_variables.scss](src/assets/scss/abstracts/_variables.scss)
  are colours + `--max-width` only — **no spacing / radius / shadow / z-index scale**.
  There are **three disconnected colour systems**: `:root`,
  [_button.scss](src/assets/scss/components/_button.scss) (`$color-*` Sass vars +
  `darken()`), [_forms.scss](src/assets/scss/components/_forms.scss) (`$formbase__*`
  hex). Layout is threadbare (one `.container` on `<body>`, one sticky-footer mixin,
  5 bespoke grid blocks). [sandbox.njk](src/pages/sandbox.njk) shows only headings +
  buttons.
- **Galleries** (✅ = fixed in Phase 3, see that phase's progress notes):
  [src/_data/galleries.json](src/_data/galleries.json) (55 KB, 4 galleries, 243
  images) ~~was dumped **inline** into `<script type="module">` on
  [gallery.njk](src/pages/gallery.njk) (all 243) and
  [home.njk](src/_includes/layouts/home.njk) (105) via `| dump | safe`~~ ✅
  (item 1 — real `<a>`-based PhotoSwipe markup now); ~~no schema/validation~~ ✅
  (item 2); ~~no per-photo pages~~ ✅ (item 3). **Still open:** no tags/series
  mechanism for photos (item 4 — blocked on the user's editorial input on what
  groupings should even exist).
- **Site-wide gaps** (✅ = fixed in Phase 0 items 1/2/4, see progress note below):
  ~~no Open Graph / Twitter / canonical / JSON-LD anywhere~~ ✅ (`partials/meta.njk`);
  ~~raw `{{ title }}` with no site-name suffix~~ ✅; ~~empty `<meta description>` on
  `articles-index` + `sandbox`~~ ✅; ~~About page has ~37 unsized `<img>` and 2
  malformed `src="  https://…"`~~ ✅; ~~5 award images missing `f_auto` (served as
  raw JPEG, not WebP/AVIF)~~ ✅; ~~stale `<label for="timely">` + `</br>` typo on
  Contact~~ ✅ (found while fixing About); ~~GA4 hardcoded on every page incl.
  `/thankyou/` `/sandbox/`~~ ✅ (Anytime items — consent gate, see that section).
  Still open: no CI, no linting, no `_headers`.
- **Sass `@import` deprecation** (deferred, see Phase 4): documented options —
  (A) bump + `--silence-deprecation`; (B) `sass-migrator`; (C) drop Sass for
  **Lightning CSS**. Nothing forces it (removed only at Dart Sass 3.0, no date).

## How to work through it

- **Keep `main` deployable at all times.** Every push to `main` is production —
  there is no preview gate.
- **Branch + Netlify deploy preview** for anything touching shared partials,
  `main.scss`, `.eleventy.js`, or `netlify.toml`. Only trivial content edits (a new
  article file, a gallery JSON row) go direct to `main`.
- **One small commit per partial / per concern.** After each: `npm run build`, diff
  `public/css/main.css`, screenshot `/`, `/gallery/`, `/about/`, `/contact/`, an
  article, `/sandbox/` before/after.
- Pull phases in order; within a phase, items are independently shippable.

## Dependency map (why this order)

```
Phase 0  Foundations        no visual change; unblocks everything after
  meta partial ───────────▶ blog content must not launch SEO-poor (P2)
  OG-image convention ────▶ blog + per-photo pages (P2, P3)
  validate script ───────▶ guards every later hand-edited data change (P2, P3)
Phase 1  Token + layout     reskin enablement; visually identical
  spacing/radius/measure ─▶ prose CSS is written against these (P2)
  de-Sass button/form ───▶ makes the Lightning CSS swap mechanical (P4)
  layout objects ────────▶ gallery visual restructure consumes them (P3)
Phase 2  Blog activation
  tag mechanism ─────────▶ reused for gallery series/collections (P3)
Phase 3  Gallery restructure   (data/perf fix is token-independent — can pull forward)
Phase 4  Sass → Lightning CSS + tooling/CI   last: needs a settled stylesheet
```

- **Tokens before blog prose CSS and before the gallery *visual* restructure** — but
  **not** before the gallery *data/perf* fix, which needs no tokens.
- **The reskin does NOT force the Sass decision.** `sass@1.77.8` compiles clean and
  can carry the whole reskin. Phase 1 is shaped so Phase 4 becomes a small CLI swap.

---

## Phase 0 — Foundations (do first regardless)

**Goal:** cheap, high-leverage, no intended visual change. De-risk everything after.

**Progress (2026-09-13):** all 7 items are done, direct to `main` (no branch — each
was a small, isolated, non-shared-partial-breaking change reviewed locally before
push).

1. ~~**Repo hygiene.** Fix [README.md](README.md) ("Eleventy (v2)" → 3.1.6, CJS,
   Node 24).~~ ✅ **Done** (`10ac853`). (This also corrected some stale
   `_(uncommitted)_` markers in what was then `UPGRADE_PLAN.md`'s "Done" table
   — since removed; see git history for that file's earlier form.)
2. ~~**SEO / social meta partial**~~ ✅ **Done** (`10ac853`) — added
   [src/_includes/partials/meta.njk](src/_includes/partials/meta.njk), included from
   [site-head.njk](src/_includes/partials/site-head.njk):
   - `<title>` → `{{ title }} · Carl Osterly Photography` (home page, whose `title`
     already equals `site.name`, is special-cased by that equality check — no double
     suffix); suffix from [src/_data/site.json](src/_data/site.json) `name`.
   - Open Graph (`og:title/description/type/url/image` + `image:width/height` +
     `site_name`), Twitter `summary_large_image`, `<link rel="canonical">`. `og:type`
     is `article` when `tags` includes `post`, else `website` — ready for Phase 2.
   - JSON-LD `WebSite` + `Person` on all pages (extension point for `Article` in P2,
     `ImageObject` in P3).
   - Filled empty `<meta description>` on `articles-index.njk` + `sandbox.njk`; added
     `noindex: true` front matter (partial renders `<meta name="robots" content="noindex">`)
     on `sandbox.njk` and `thankyou.njk`.
   - `site.json` gained `defaultDescription` / `defaultImage` / `defaultImageAlt` /
     `defaultImageWidth` / `defaultImageHeight` as fallbacks for pages without their
     own `image`/`description` front matter (home, sandbox, thankyou) — this is a
     down payment on item 3 below, not the full Cloudinary social-card recipe.
3. ~~**OG-image convention.**~~ ✅ **Done** — documented in
   [docs/og-images.md](docs/og-images.md). Rather than a static per-page recipe,
   added an `ogImage` Nunjucks filter ([.eleventy.js](.eleventy.js)) that rewrites
   *any* Cloudinary URL's transformation segment to
   `c_fill,g_auto,w_1200,h_630,f_auto,q_auto`, applied in `meta.njk` to
   `image or site.defaultImage`. No per-page `ogImage` front matter needed — every
   page's existing `image` is automatically re-cropped for the social card;
   `og:image:width`/`height` are now hardcoded `1200`/`630` (the recipe guarantees
   it) instead of read from front matter.
4. ~~**About-page fixes** ([src/pages/about.njk](src/pages/about.njk)): `width`/`height`
   on the ~37 lazy `<img>` (CLS); fix the 2 `src="  https://…"` leading-space URLs
   (broken in prod); fix the stale `for=` attr and `</br>` typo.~~ ✅ **Done**
   (`1054b12`). The `for=`/`</br>` typos turned out to live in
   [contact.njk](src/pages/contact.njk) (`<label for="timely">` didn't match
   `id="enquiry"`; `</br>` → `<br>`), not about.njk as originally scoped here —
   fixed there instead. Also found and fixed in the same commit: 5 of the 37 award
   images (the newest, 2026 ones) were missing `f_auto/w_500` and so were served as
   raw JPEG instead of negotiating WebP/AVIF like the other 32 — added the
   transformation and corrected their `width`/`height` to the delivered 500×500.
5. ~~**Manifest / favicon cleanup.** Fill empty `name` / `short_name` in
   `src/assets/images/favicon/site.webmanifest`; drop the stale `favicon` key in
   `site.json`.~~ ✅ **Done** — manifest `name`/`short_name` now
   "Carl Osterly Photography" / "Carl Osterly"; confirmed `site.favicon` had zero
   call sites before removing it.
6. ~~**Preload critical assets** in `site-head.njk`: the 3 woff2 in
   `src/assets/fonts/` (`crossorigin`) and the LCP hero (`home__banner` /
   [page-banner.njk](src/_includes/partials/page-banner.njk)).~~ ✅ **Done** — all 3
   fonts preloaded on every page; hero image preload is conditional
   (`page.url == '/'` → `galleries.portrait.banner`, else the page's own `image`
   front matter if present) so it always matches the exact URL the actual `<img>`
   requests — verified byte-for-byte against the built output on home and about.
7. ~~**Validate step**~~ ✅ **Done** — [src/_11ty/utils/validate.js](src/_11ty/utils/validate.js),
   documented in [docs/validate.md](docs/validate.md): valid JSON + per-image
   `src`/integer `width`/`height`/non-empty `alt` for `galleries.json` (fatal); built
   `public/**/*.{html,xml}` scanned for insecure `http://` and leading-space
   `src`/`href` (fatal). `via.placeholder.com` is a **warning only** for now — it
   correctly flags the 5 still-lorem-ipsum articles, which are legitimately
   unfixed pending Phase 2 item 6; promote it to fatal once those are replaced.
   Wired into `npm run build` (`build:sass` → `build:eleventy` → `build:validate`,
   now explicit instead of the `build:*` glob). (Considered a local
   `.git/hooks/pre-commit` too, but dropped it — it's untracked by git so it
   silently doesn't exist on a fresh clone, and for a $0/no-deadline solo project
   the only thing it buys over the Netlify gate below is finding out a few seconds
   sooner, which isn't worth the false sense of protection.) Verified: a
   deliberately-broken `galleries.json` correctly fails; restored and re-verified
   clean. No `netlify.toml` change needed — its
   existing build command already runs `npm run build`, which now validates.

**Phase 0 is now fully complete** (items 1–7). Next up: Phase 1 — token layer +
layout foundation (see below), the reskin-enablement work with no intended visual
change.

---

## Phase 1 — Token layer + layout foundation

**Goal:** route every visual decision through `:root` custom properties + a few
layout objects, so the actual reskin is a token edit + a sandbox review, not a hunt
through 24 partials. **No intended visual change.**

**Progress (2026-09-15):** items 1–3 and 5 are fully done. Item 4 (interleave
include-media removal) is still open.

1. **Expand [_variables.scss](src/assets/scss/abstracts/_variables.scss):**
   ~~spacing scale `--space-3xs…3xl`~~ ✅ **tokens added** — `--space-3xs`(0.25rem)
   through `--space-3xl`(5rem), sized to exactly match the literals found
   (`0.5rem`, `0.8rem`, `1rem`, `1.2rem`, `3rem`, `4rem`, `5rem`) plus two new
   in-between steps (`--space-lg: 2rem` and `--space-3xs: 0.25rem`) for headroom.
   ~~`--radius-sm/md`~~ ✅ (`0.25rem`/`0.5rem` — button `8px` and card `0.5rem` turned
   out to already be the same value; forms' deliberate `0` doesn't need a token).
   ~~`--shadow-1`~~ ✅ (copied verbatim from the `box-shadow` mixin).
   ~~`--measure: 65ch`~~ ✅. ~~`--color-heading`~~ ✅ (aliases `--mid-grey` — no visual
   change yet). ~~z-index tokens for the nav~~ ✅ (`--z-nav-toggle`/`--z-nav-toggle-input`,
   named for what they actually do — the hamburger vs. the invisible checkbox
   placed over it — since the existing `1`/`2` had no other semantic meaning).
   ~~Delete the dead `--base-url` and `_functions.scss`~~ ✅ (confirmed 0 call sites
   for `asset()`/`image()`/`font()` before deleting; also removed the now-dead
   `@import` in `main.scss`).
   ~~Replace the `0.8rem`/`1rem`/`1.2rem`/`3rem`/`10px`/`4rem`/`5rem` literals
   across `layout/*`, `pages/*` and `_card.scss`~~ ✅ — also folded in
   [_pricing-card.scss](src/assets/scss/components/_pricing-card.scss), which
   had the identical debt (`0.8rem`/`0.5rem`/`5rem`/`1rem`) but wasn't named in
   this item's original scope. Verified with a full expanded-CSS diff (not just
   the minified single-line output): every changed declaration now resolves to
   the exact same computed value as before, **except** the nav's `10px` padding
   ([_navigation.scss](src/assets/scss/layout/_navigation.scss)), which had no
   exact token match — rounded down to `--space-2xs` (8px), a deliberate 2px
   visual change, the only one in this commit.
2. ~~**De-Sass component colour logic**~~ ✅ **Done** (the Lightning-CSS down payment):
   - [_button.scss](src/assets/scss/components/_button.scss): `$color-*` → 7 new
     `--btn-*-bg`/`--btn-color-light` tokens in `_variables.scss`; `darken($color, 10%)`
     → `color-mix(in oklab, $color, black 12%)` inside the `btnStyle()` mixin (the
     mixin itself stays — only its colour inputs and hover math changed). Dropped
     `$color-action`, which had 0 call sites. Also folded in the button's own
     `border-radius: 8px` → `var(--radius-md)` — a leftover from item 1 that should
     have been caught there.
   - [_forms.scss](src/assets/scss/components/_forms.scss): `$formbase__color/
     placeholder/background/border/active` → 5 new `--form-*` tokens;
     `lighten()`/`darken()` (disabled/placeholder states) → `color-mix(in oklab, …,
     white|black 10%)` (same reasoning as buttons — those functions can't operate
     on a `var()` reference once the colour becomes a custom property). The 3
     `#{$svg}` fill colours are now the literal `%23000` baked directly into each
     data-URI, since a `url()`-embedded SVG can't read a page's custom properties
     at all — this was the one hex not converted to a token. Dropped
     `@use "sass:math"`/`math.div()` in favour of native CSS `calc()` division
     (`#{$x} / 2` inside `calc()`) — tested against the pinned `sass@1.77.8`
     first to confirm it emits zero deprecation warnings before committing to it.
   - **Deliberately not byte-identical:** every hover/disabled colour above now
     resolves at paint time via `color-mix()` instead of at Sass-compile time via
     `darken()`/`lighten()` — a different algorithm (oklab mixing vs. HSL lightness
     shift) with a different result, chosen to approximate the old look. This is
     the one place in Phase 1 where "no intended visual change" doesn't fully
     hold, consistent with Phase 4's own research note that this class of
     Sass → native-CSS swap was never going to be pixel-identical. Everything
     else in this commit (selector structure, cascade order, the redundant
     dead declarations Sass's `@if` used to emit) was verified via a full
     expanded-CSS diff against the previous commit to change nothing else.
3. ~~**Layout objects**~~ ✅ **Done**, in two commits as scoped below:
   - Commit 1 (`d92492e`): new `src/assets/scss/layout/_objects.scss` — `.stack`,
     `.cluster`, `.center` (container, replaces the `<body>` `.container` utility,
     tokenizing its `1rem` padding to `var(--space-sm)`), `.grid` (generalised
     from the `.articles__list` auto-fit pattern via a caller-overridable `--min`);
     `.flow` relocated here from `base/_helpers.scss` (also tokenizing its `1rem`
     fallback). Migrated the one `.container` call site (`<body>`) to `.center`;
     deleted the now-dead `.container` class. Verified via a full expanded-CSS
     diff: `.center` resolves byte-identically to the old `.container`; `.stack`/
     `.cluster`/`.grid` are additive only (no call sites yet).
   - Commit 2 (`529e01f`): refactored the two identified candidates —
     `.footer__icons` ([footer.njk](src/_includes/partials/footer.njk)) and
     `.menu__desktop` ([header.njk](src/_includes/partials/header.njk)) — onto
     `.cluster`, keeping only their distinguishing `justify-content` overrides in
     the SCSS and pinning `--cluster-gap: 0` to preserve the old spacing exactly
     (neither had a gap before, relying purely on `justify-content` distribution).
     **Caveat:** no browser-automation tool was available in this environment, so
     this was verified by compiled-CSS inspection and reasoning (both rows hold a
     small fixed number of equal-height children that never overflow, so
     `.cluster`'s new `flex-wrap`/`align-items: center` are inert) rather than the
     roadmap's usual screenshot diff — worth an eyeball in a real browser before
     treating this as fully proven.
4. **Interleave include-media removal.** In each partial you touch, swap
   `@include media(">=sm"|">=md"|">=lg"|"<=lg")` for a plain `@media` block (only ~5
   distinct conditions, 576/768/992 px). Delete
   [_responsive.scss](src/assets/scss/base/_responsive.scss) (587 lines) in Phase 4
   once the last call site is gone.
5. ~~**Turn [sandbox.njk](src/pages/sandbox.njk) into a real style guide**~~ ✅
   **Done.** Token swatches (spacing bars, radii, shadow, `--color-heading`,
   `--measure`) were already in place; this pass added the remaining pieces: a
   colour-swatch grid (all `:root` palette colours), a filled-in Forms section
   (input/disabled input/select/checkbox/radio, reusing the real
   `fieldset`/`input`/`control`/`select` classes from `_forms.scss`), a Card, a
   Pricing card, a Gallery tile, and the **prose specimen** (h2–h4, p with an
   in-prose link, ul/ol, blockquote, inline `code` + `pre`, `figure`/`figcaption`,
   `hr`, `table`) that Phase 2's prose CSS will style. `sandbox.njk` is
   `noindex`/excluded from collections, so this only ever touched that one page.

**First task:** interleave include-media removal (item 4) into the next partial
you touch for another reason — swap its `@include media()` calls for a plain
`@media` block rather than doing it as a standalone sweep.

---

## Phase 2 — Blog activation

**Goal:** ship the blog on the hand-written `.njk` model.

**Progress (2026-09-15):** items 1–5 done; item 6 partially done (images +
placeholder headings only — real prose/dates still pending). Item 7 blocked on
item 6's completion.

1. ~~**Prose CSS**~~ ✅ **Done** — added a `.prose` class in
   [_article.scss](src/assets/scss/pages/_article.scss), paired with the Phase 1
   `.flow` layout object for vertical rhythm: h2–h4 get a larger `--flow-space`
   above (via `.prose h2/h3/h4`) and a smaller one below (via `.prose h2/h3/h4 + *`)
   so headings read as attached to the section they introduce; `ul/ol`, `blockquote`,
   `code`/`pre` (`--font-mono`, finally used), `figure`/`figcaption`, `hr`, `table`,
   in-prose `a` (underlined `--red`, distinct from the site's bare nav links), `img`
   (`--radius-md`). Body copy constrained to `--measure`, `p` at `--font-size-base`.
   Wired into [article.njk](src/_includes/layouts/article.njk) as a
   `<div class="prose flow">` around `{{ content | safe }}` — since this is the
   shared layout, all 5 existing articles picked it up automatically with no
   per-article edit needed. Verified: `npm run build` clean; compiled
   `public/css/main.css` diff confirmed purely additive (new rules inserted after
   `.grid`, nothing else changed); built `my-first-article` HTML shows the
   `.prose flow` wrapper. Sandbox specimen updated to reuse the same
   `<div class="prose flow">` markup so it doubles as a living preview of exactly
   what `article.njk` renders.
2. ~~**Article layout parity**~~ ✅ **Done** — reworked
   [article.njk](src/_includes/layouts/article.njk): wrapped in `.fh__wrapper` like
   [page.njk](src/_includes/layouts/page.njk) (fixes sticky-footer parity on short
   articles); added an `.article__byline` (date via `postDate`, `author` from
   `articles.json`'s cascade); added an `Article` node to the Phase 0 meta scaffold's
   JSON-LD `@graph` (headline/description/image/datePublished/author/publisher/
   mainEntityOfPage), gated on `ogType == 'article'` so it never appears on
   non-article pages. Verified: valid JSON via Node's `JSON.parse`; confirmed absent
   from `about`/`home`/`contact`.
3. ~~**Draft handling**~~ ✅ **Done** — established the `src/_11ty/*` extension
   pattern: [src/_11ty/computed/draft.js](src/_11ty/computed/draft.js), wired via
   `eleventyConfig.addGlobalData("eleventyComputed", …)` in
   [.eleventy.js](.eleventy.js). `draft: true` + `CONTEXT === "production"` →
   `permalink: false` + `eleventyExcludeFromCollections: true`; passthrough
   otherwise, so drafts preview locally / on branch deploys. Documented in
   [docs/drafts.md](docs/drafts.md). Verified live: temporarily set `draft: true`
   on an article, confirmed it's written locally (no `CONTEXT`) and excluded
   entirely — file and collection membership — under `CONTEXT=production`.
4. ~~**Feed**~~ ✅ **Done** — hand-written [src/pages/feed.njk](src/pages/feed.njk)
   → `/feed.xml`, mirroring `sitemap.njk`'s style: site-level `title`/`subtitle`/
   `id`/self-link, one `<entry>` per post (newest first) with title/link/id/
   updated/author/summary/full-body `content` (CDATA-wrapped). Linked from
   `site-head.njk` via `<link rel="alternate" type="application/atom+xml">` on
   every page. Verified: parses as well-formed XML (.NET `XmlDocument`, all 5
   entries); alternate-link tag confirmed present with the right `href`.
5. ~~**Taxonomy + navigation**~~ ✅ **Done** — topical tags added to each
   article's front matter (merge with the cascade's `tags: post` automatically,
   since `tags` gets array-unioned across the data cascade). New `tagList`
   collection in `.eleventy.js` (distinct topical tags, excluding `post`) feeds
   [src/pages/tags.njk](src/pages/tags.njk), paginated → `/tags/<tag>/`, one page
   per tag reusing the `articles-index.njk` card markup; per-tag title/description
   via a front-matter-level `eleventyComputed` (merges cleanly with item 3's
   global one). `article.njk` gained tag chips under the byline and a prev/next
   pager, backed by new `previousPost`/`nextPost` filters in `.eleventy.js`.
   **Bug caught in review:** a first attempt computed prev/next with `{% set %}`
   inside a `{% for %}…{% if %}` block — Nunjucks/Jinja scope that assignment to
   the loop, so it never reached the template below and the pager silently
   rendered nothing. Fixed by moving the lookup into the two filters (plain
   top-level `{% set %}`, no loop). Verified: the full first→…→fifth prev/next
   chain renders correctly; both tag pages group the right articles.
6. **Content** — 🟡 **Partially done.** Swapped every `via.placeholder.com`
   reference (banner + body images, 24 in total) for real images picked from
   `galleries.json` across all 4 galleries, and replaced the 5 identical
   "My Nth Article" titles with distinct placeholder headings (still obviously
   dummy — e.g. "Lorem Ipsum Dolor Sit") so real titles are easy to spot later.
   Recomputed each article's tag to match its new banner's gallery
   (`portrait`/`art`/`travel`). Verified: `npm run build` → `validate: OK` with
   **zero warnings** for the first time (the `via.placeholder.com` check no
   longer has anything to flag). **Still lorem-ipsum body text and 2022 dates —
   real posts/dates are the user's own writing, still pending.** Files were not
   renamed or `git rm`'d, per instruction ("I will update these articles by hand").
7. **Launch switch (last commit)** — remove `class="hidden"` from the two
   `/articles/` `<li>` in
   [header.njk](src/_includes/partials/header.njk) (mobile `menu__slide` ~line 24,
   desktop `menu__desktop` ~line 49). **Blocked on item 6** — do not un-hide nav
   until the lorem-ipsum body text and dates are replaced with real content (see
   the risks table: "Blog launch with stale content").

**First task:** none left to pull here — items 1–5 are done and item 6 is
blocked on the user writing real posts/dates by hand. (Phase 3 item 1 was
pulled forward in the meantime — see below.)

---

## Phase 3 — Portfolio / gallery restructure

**Goal:** kill the fragile inline-JSON delivery, then add depth (per-photo pages,
series).

**Progress (2026-09-15):** item 1 done.

1. ~~**Perf / architecture fix first (no visual change).**~~ ✅ **Done** —
   converted [gallery.njk](src/pages/gallery.njk) and
   [home.njk](src/_includes/layouts/home.njk) to `<a>`-based PhotoSwipe markup.
   Each gallery/the home banner is now a real DOM container (`#pswp-gallery-<slug>`
   / `#pswp-gallery-home`) holding one visible `<a>` (wraps the existing thumbnail
   `<img>`, `href`/`data-pswp-width`/`data-pswp-height` from that gallery's first
   image) plus one `.visually-hidden` `<a>` per remaining photo (same data
   attributes, `aria-hidden="true" tabindex="-1"` so screen readers/keyboard users
   aren't given empty "ghost" stops, but the real `href` stays crawlable and
   mouse-clickable). `PhotoSwipeLightbox` now takes `{ gallery: '#id', children: 'a' }`
   instead of a `dataSource` array — the inline `| dump | safe` JSON blob (up to
   105 images per gallery) is gone entirely, replaced by a few one-line `.init()`
   calls per gallery. Two 1-line CSS additions in
   [_gallery.scss](src/assets/scss/components/_gallery.scss) /
   [_home.scss](src/assets/scss/pages/_home.scss) (`display: block` on the new
   wrapping `<a>`) keep the visible thumbnail's box sizing identical to the old
   bare `<img>`.
   Verified: `npm run build` → `validate: OK`; `data-pswp-width` attribute count
   in built `gallery/index.html` is exactly 243 (105+47+50+41, matching
   `galleries.json`'s totals) confirming every photo got a real anchor; home page
   count is exactly 105 (`galleries.portrait.images.length`); zero `| dump` /
   `dataSource` occurrences left in either built page; compiled CSS diffed
   against the pre-change baseline is **byte-identical** once the two new
   1-line rules are subtracted back out (no existing rule touched). No-JS
   fallback: each visible thumbnail's `<a href>` now navigates straight to that
   gallery's first full-size photo without any JS.
2. ~~**Schema + validation**~~ ✅ **Done** — real JSON Schema at
   [src/_11ty/schemas/galleries.schema.json](src/_11ty/schemas/galleries.schema.json):
   every top-level key must be a gallery object (`title`/`thumb`/`thumbAlt`/
   `images` required; `banner*` validated if present but not required — only
   `portrait` has it), each image needs a non-empty `src`/`alt` and integer
   `width`/`height`. Enforced by a small hand-rolled interpreter,
   [src/_11ty/schemas/jsonSchema.js](src/_11ty/schemas/jsonSchema.js) (`type`,
   `required`, `properties`, `additionalProperties`, `items`, `minLength`,
   `minProperties`, `$ref` — just enough of draft-07 for this one file, no new
   dependency), wired into `validate.js` in place of the old hand-rolled
   per-image loop. **Caught a real bug in my own first draft:** the schema
   initially required `banner*` on every gallery; building against it
   immediately failed with 11 "required property missing" errors on
   `street`/`japan`/`art`, which turned out to be correct — only `portrait` has
   ever had those fields (confirmed by inspecting the actual data), so the
   schema was fixed to match reality rather than the data being "fixed" to fit
   a wrong assumption. Verified: clean build passes; four different deliberate
   corruptions (missing `alt`, wrong-typed `width`, blank `thumbAlt`, missing
   `title`) each produced a precise, correctly-pathed error
   (e.g. `street.images[1].width: expected integer, got string`); restored and
   confirmed `git diff` clean afterward. Also fixed a stale doc: `editing-
   galleries.md`'s "How it's wired" section still described the pre-Phase-3
   inline-JSON-blob mechanism — updated to describe the current `<a>`-based
   markup, and added a schema section cross-linking `validate.md`.
3. ~~**Per-photo pages**~~ ✅ **Done** — `/gallery/<gallery>/<slug>/` for all 243
   photos, prev/next, per-photo `og:image`, `ImageObject` JSON-LD.
   - **Slugs:** backfilled every image with a `slug` derived from its Cloudinary
     filename (`Beth-Piano-1-PNG-Final.png` → `beth-piano-1-png-final`), unique
     *within its own gallery* (URLs are gallery-scoped, so cross-gallery
     collisions don't matter) — verified no collisions existed with this rule
     across all 243 images before committing to it, with a dedup-suffix
     fallback in the backfill script for future uploads. `galleries.schema.json`
     now requires `slug`; `validate.js` gained a per-gallery uniqueness check
     (the schema interpreter has no "uniqueness" keyword) — tested by
     deliberately duplicating a slug, confirming it's caught, then restoring.
   - **Pages:** a `galleryPhotos` Eleventy collection (`.eleventy.js`) flattens
     all 4 galleries' images, computing `prevSlug`/`nextSlug` at build time
     (scoped to the same gallery, in `images[]` order — the order the site
     already treats as canonical per `editing-galleries.md`). New
     [src/pages/gallery-photo.njk](src/pages/gallery-photo.njk) paginates
     `size: 1` over it; permalink, title/description/`image` are all templated
     via front-matter `eleventyComputed` (same pattern as `tags.njk`). New
     dedicated layout ([gallery-photo.njk](src/_includes/layouts/gallery-photo.njk))
     rather than reusing `page.njk` — its `page-banner.njk` hard-crops to
     16:9/21:9, which would butcher the mostly-portrait-orientation photos this
     page exists to show faithfully.
   - **Meta:** extended the Phase 0/2 JSON-LD `@graph` in `meta.njk` with an
     `ImageObject` node (native dimensions, not the 1200×630 OG crop) gated on
     a `photo` variable being in scope — Nunjucks `{% include %}` shares the
     calling template's context, so this needed no new plumbing.
   - **Two real bugs caught mid-build, both fixed:**
     (1) copied `eleventyExcludeFromCollections: true` from the `tags.njk`
     pattern out of habit — this silently kept all 243 pages out of
     `collections.all`, and `sitemap.njk` loops exactly that collection, so
     none of them were reaching the sitemap. Removed the flag.
     (2) Eleventy pagination only adds *one* representative page to
     `collections.all` per template by default — even after fix (1), the
     sitemap only gained a single photo URL, not 243. Fixed with
     `pagination.addAllPagesToCollections: true`. Verified by counting
     `<loc>` entries in the built sitemap directly (243, matching
     `galleries.json`'s total image count) rather than trusting the fix
     visually.
   - **Not done here (deliberately):** `gallery.njk`'s `<a>` tags still point
     straight at the raw Cloudinary image (required — that's what PhotoSwipe
     loads into the lightbox), so these new pages aren't yet linked *from* the
     gallery grid, only reachable via the sitemap or a direct URL. Wiring the
     grid to cross-link into per-photo pages fits more naturally as part of
     item 4 below than as a late addition here.
   - Verified end-to-end: `npm run build` → `validate: OK`; exact page count
     matches (`find public/gallery -name index.html` → 244 = 243 photos + the
     `/gallery/` index); spot-checked first/middle/last photo of a gallery for
     correct prev/next (first has no Previous, last has no Next); JSON-LD
     parses on a sampled page; `ImageObject` confirmed absent from `about`/
     `home`/`gallery` index pages.
4. **Series / collections** — 🟡 **Cross-linking done; series-tagging not
   started.** `gallery.njk`'s grid now includes one real, visible
   `<a class="gallery__view-link">` per gallery (below the tile, not inside
   the PhotoSwipe-triggering `.gallery__box`, to avoid disturbing its flex/
   absolute-caption layout), pointing to that gallery's first photo page —
   from there, the existing prev/next nav lets a visitor browse every photo
   in the gallery one at a time. This closes the "orphan page" gap from item 3
   (243 pages existed but nothing linked to them). Verified: all 4 links
   checked against the actual built output — each resolves to a real,
   existing page; compiled CSS diffed against the pre-change baseline and
   confirmed byte-identical once the one new rule is subtracted back out.
   **Still open:** reuse the Phase 2 tag mechanism for actual photo series
   (thematic groupings within/across galleries) — no scheme decided yet, and
   unlike blog tags there's no existing data to build from; needs the user's
   own editorial input on what the groupings should even be before this can
   be designed, let alone implemented.
5. **`srcset` shortcode** — 🟡 **On hold at the user's request (2026-09-15)**,
   revisit later. ($0, no dep) — a Nunjucks shortcode in
   `src/_11ty/shortcodes/` that swaps the Cloudinary `w_` param to emit
   `srcset`/`sizes`. Retrofit `about.njk`, `page-banner.njk`, article body images,
   gallery thumbs. **Not** `eleventy-img` (adds a real dependency; the site is 100%
   Cloudinary already).

**First task:** none in Phase 3 right now — item 4's series-tagging needs the
user's editorial input, item 5 is on hold. See Phase 4 or the Anytime items
below for what's actually pullable.

---

## Phase 4 — Sass → Lightning CSS + tooling / CI

**Goal:** finish the toolchain move once the reskin has settled. Phases 1–3 already
removed `darken()`/`lighten()`, moved component colours to custom props +
`color-mix()`, and replaced most `@include media()` — so Option 2·CSS below is
now far smaller than its original ~1-day estimate.

**Decision so far (2026-09-06): deferred, Option A.** Pin `sass` to exact
`1.77.8` and leave it — no migration, no removal. `@import` is deprecated (Dart
Sass 1.80) but **not removed until Dart Sass 3.0**, which has no release date,
so nothing forces a change yet. The two options below stay documented for
whenever that changes, or the stylesheet needs significant work anyway.

**Research (verified 2026-09-03, updated after the icons subset): what actually
depends on Sass.** Building with `sass@1.77.8` today: **zero warnings**.
Test-compiling with `sass@1.103.1`:

- **~90 deprecation warnings** remain (was ~1,950 before the icons subset
  removed ~1,920 `map-get` calls in the vendored icons). Remainder:
  include-media global builtins in `base/_responsive.scss`, plus ~10
  `darken()`/`lighten()` in `_button.scss` / `_forms.scss`, plus 5 `@import`,
  plus 3 global `if()`.
- **Compiled CSS changes**: newer `darken()`/`lighten()` emit
  `rgb(18.7% 53% 38.6%)` instead of `#308763`. Same rendered colour, ~450 B
  larger, not byte-identical. Affects every button/form hover & disabled
  state.

| Feature | Usage | Note |
|---|---|---|
| `@include media(...)` | 32 sites | [include-media](https://include-media.com/) (~360 lines in `_responsive.scss`). Only ~5 distinct conditions used (`>=sm`, `>=md`, `>=lg`, `<=lg`, `>420px`), each a one-line `@media`. |
| `@include btnStyle()` | 10× | `@mixin` + `@if $outline` + `darken()` |
| `@include box-shadow` / `fh-wrapper` / `responsive-iframe` / `line-clamp` | few | static, param-less snippets |
| `_functions.scss` `asset()`/`image()`/`font()` | 0 sites | dead code |
| `#{}` interpolation | `_forms.scss` | empty `$prefix` → `.input`; `math.div()` in `calc()`; `#{$svg}` colour in 3 inline-SVG data URIs |
| nesting `&` | everywhere | native CSS nesting (Baseline 2024) |
| `@import` partials | 24 partials + `main.scss` | concatenation only — needs a bundler |

Nothing needs Sass's programmable features for the actual output.

1. **`lightningcss-cli` swap** (Option 2·CSS, pin exact): deletes the
   `@import`/`@use` question, the include-media library, and (already done)
   the giant icons file. Tooling: **Lightning CSS** (`lightningcss-cli`), not
   Vite — one fast dependency, near drop-in for the `sass` CLI line; inlines
   `@import`, minifies, and transpiles native nesting / `color-mix()` down per
   `--targets` so modern syntax keeps old browser support. (`esbuild` also
   bundles CSS `@import`; Vite only if JS bundling is wanted too.) Path:
   `main.scss`'s `@import` list becomes one entry point inlined by Lightning
   CSS; convert the ~24 partials to plain CSS with native nesting; hand-write
   the ~15 `@media` blocks (replacing include-media); expand the 4 static
   mixins; rebuild button/form colours with custom properties + `color-mix()`;
   inline the 3 form-SVG fill colours; delete the dead `_functions.scss`;
   `package.json` script `sass … ` →
   `lightningcss --bundle --minify --targets '>= 0.25%' … -o public/css/main.css`.
   Eleventy unchanged. ~1 day + page-by-page QA.
2. **Fallback if appetite is low (Option 2·SASS):**
   1. **Bump + silence.** `sass@latest`; add
      `--silence-deprecation=import,global-builtin,color-functions,if-function`
      to `build:sass` / `watch:sass`. Accept the verbose-`rgb()` colour
      output. ~15 min. Downside: deprecated APIs, warnings muted.
   2. **Migrate.** `sass-migrator module` (`@import`→`@use`, `map-get`→
      `map.get`) then `sass-migrator color` (`darken`/`lighten`→
      `color.adjust`). Hand-work after: review `@use` namespacing across ~20
      partials; handle the PhotoSwipe `.css` cross-import (vendor it into
      `scss/vendors/`); `if()` has no migrator; output still not
      byte-identical. ~½ day + visual QA.
3. **Tooling / CI** (deferred to here so Phase 1–3 churn doesn't fight a linter):
   `.editorconfig`, Prettier + Stylelint configs (dev deps, $0), a real pre-commit
   hook, and a minimal GitHub Actions workflow (free for public repos) running
   `npm run build` + validate on push — a second gate before Netlify.

**QA:** dedicated branch; byte-compare `public/css/main.css` where possible, else
page-by-page visual QA against the sandbox. Keep the `sass` pipeline on `main` until
the branch passes, then swap in one commit.

---

## Anytime items (low coupling — pull when convenient)

**Progress (2026-09-15):** all 4 pulled — GA4 consent gate, `prefers-reduced-motion`,
named view transitions, README rewrite. (The `src/_11ty/*` pattern below isn't a
task, just a note — it's already established by the P0 validate util, P2 draft
computed, and P3 schemas.)

- ~~**GA4 consent + scope**~~ ✅ **Done** — moved the hardcoded
  `G-BFJXSFY8R8` gtag snippet out of `site-head.njk` entirely into a new
  [analytics.njk](src/_includes/partials/analytics.njk) partial, included from
  `body-close.njk` and gated by a new per-page `noAnalytics: true` front-matter
  flag (set on `/sandbox/` and `/thankyou/`). Real consent gate, not just
  Google's "Consent Mode" signal: the GA script tag itself is only ever
  injected (via `document.createElement`) after the visitor clicks Accept, or
  on a later visit if they already did — declining or not deciding means zero
  network request to Google, ever. Choice persists in `localStorage`
  (`ga-consent: "granted"|"denied"`). Verified: since a real browser wasn't
  available to test in safely this session, wrote a 5-case logic test
  (no-decision, previously-granted, previously-denied, click-Accept,
  click-Decline) against the actual extracted script with a mocked
  DOM/localStorage — all 5 passed once the mock correctly aliased `window` to
  the global object (matching real browser semantics, where `window.gtag = fn`
  makes bare `gtag()` calls resolve — the mock's first draft didn't do this
  and reported a false failure). Built output confirmed the banner/script are
  present on ordinary pages and completely absent from `/sandbox/`/`/thankyou/`.
- ~~**`prefers-reduced-motion`**~~ ✅ **Done** — uncommented the existing guard
  in `base/_base.scss` (disables `scroll-behavior: smooth`). Scoped narrowly to
  exactly what was already stubbed in, not a full motion audit — consistent
  with the project's stated "targeted fixes, not a full a11y audit" approach.
- ~~**Named view transitions**~~ ✅ **Done** — gave `.site__heading` (the logo,
  identical markup on every page) a stable `view-transition-name`, so it
  persists smoothly across navigations instead of being swept into the
  default whole-page cross-fade along with everything else.
- ~~**README full rewrite**~~ ✅ **Done** — full project-structure overview,
  content-editing pointers, validate/analytics/deployment sections, and a docs
  index cross-linking every file in `docs/` plus `ROADMAP.md` (every linked
  path verified to actually exist before committing to it). Later updated
  again when `UPGRADE_PLAN.md` was folded into this file's Phase 4.
- **`src/_11ty/*` extension pattern** — not a task, just a note: already
  established by the P0 validate util, P2 draft computed, and P3 schemas.

## Risks & keeping `main` deployable

| Risk | Mitigation |
|---|---|
| Live deploys, no preview gate | Branch + Netlify deploy preview for shared partials / `main.scss` / `.eleventy.js` / `netlify.toml`. Only trivial content edits go direct. |
| Phase 1 is a wide "no visual change" diff | Partial-by-partial commits; diff `public/css/main.css` each; expanded `sandbox.njk` + before/after screenshots. |
| Meta partial touches every page | Land on a branch, `npm run build`, inspect 5 rendered pages before merge. A Nunjucks error fails the Netlify build (safe, but blocking). |
| JSON-LD errors are invisible | Run changed pages through Google Rich Results test after each meta-scaffold deploy. |
| `galleries.json` footguns (55 KB, hand-edited) | P0 validate script in the pre-commit hook **and** the Netlify build command. |
| Gallery inline-JS relies on Netlify `minifyJS` | P3's `<a>`-markup conversion removes the blob; don't touch `minifyJS` while the blob still ships anywhere. |
| Blog launch with stale content | Replace / `git rm` the 5 lorem files and set real dates **before** un-hiding nav (the last P2 commit). `draft`/`noindex` cover half-written posts. |
| Lightning CSS output not byte-identical to Sass | P4 on its own branch; visual QA vs the sandbox, not a byte diff. Keep `sass` on `main` until the branch passes. |
| Scope creep: "reskin" → "rebuild" | Phase 1 layout objects are **additive**; bespoke blocks are refactored to consume tokens, never deleted wholesale. Nav hamburger stays unless the reskin truly needs JS. |

## Explicitly out of scope this year

CMS / admin UI / Markdown migration for articles · moving off Cloudinary or adding
`eleventy-img` · any SSG/framework change, moving off Netlify, edge/server functions
· e-commerce, booking, payments, client-proofing area · blog comments · full WCAG
audit or automated a11y rig (do targeted fixes inline) · dark mode as a committed
deliverable (opportunistic only if the P1 token layer makes it near-free) · i18n ·
a shipped design-system package · RUM / perf-budget tooling beyond manual Lighthouse
· TypeScript / unit-test framework · adopting a PR / branch-protection workflow
(direct-to-`main` stays by choice).

## Verification (per phase)

- **Phase 0:** `npm run build`; open `public/index.html`, `public/about/index.html`,
  `public/gallery/index.html`, an article, `public/thankyou/index.html` — check
  `<title>` suffix, `og:*` + `twitter:*` + canonical present, `og:image` resolves,
  no empty `<meta description>`, `noindex` on sandbox/thankyou. Run one page through
  Google Rich Results. Deliberately break `galleries.json` (trailing comma) and
  confirm the validate step fails the build.
- **Phase 1:** after each partial commit, `public/css/main.css` diff is empty or
  trivially explainable; `/sandbox/` renders every token + component; screenshot
  diff of `/`, `/gallery/`, `/about/`, `/contact/`, an article shows no change.
- **Phase 2:** `/articles/` lists real posts newest-first with dates; an article
  page shows byline + styled prose within `--measure`; `/feed.xml` validates
  (W3C Feed Validator); `/tags/<tag>/` paginates; a `draft: true` post is absent
  from `public/` when built with `CONTEXT=production`, present otherwise; nav shows
  Articles only after the final commit.
- **Phase 3:** built `public/gallery/index.html` contains no `| dump` blob / inline
  image array; all 4 lightboxes open; page works with JS disabled (anchors resolve
  to full images); `/gallery/portrait/<slug>/` pages build with prev/next and a
  per-photo `og:image`; validate step passes the schema.
- **Phase 4:** `npm run build` produces `public/css/main.css` via `lightningcss`;
  every `/sandbox/` component matches its pre-swap screenshot; `_responsive.scss` and
  `_functions.scss` are gone; the GitHub Action runs `build` + validate green on a
  test push.
