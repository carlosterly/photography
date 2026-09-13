# carlosterly.photography — 12-month roadmap

A prioritised backlog to pull from in order — not a dated schedule. Companion to
[UPGRADE_PLAN.md](UPGRADE_PLAN.md) (tech-debt log; its one open item, §2, is folded
into Phase 4 below).

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
- **Galleries**: [src/_data/galleries.json](src/_data/galleries.json) (55 KB, 4
  galleries, 243 images) is dumped **inline** into `<script type="module">` on
  [gallery.njk](src/pages/gallery.njk) (all 243) and
  [home.njk](src/_includes/layouts/home.njk) (105) via `| dump | safe`; only
  Netlify's `minifyJS` shrinks it. No per-photo pages, no tags, no `<a>`-based
  PhotoSwipe, no schema/validation.
- **Site-wide gaps** (✅ = fixed in Phase 0 items 1/2/4, see progress note below):
  ~~no Open Graph / Twitter / canonical / JSON-LD anywhere~~ ✅ (`partials/meta.njk`);
  ~~raw `{{ title }}` with no site-name suffix~~ ✅; ~~empty `<meta description>` on
  `articles-index` + `sandbox`~~ ✅; ~~About page has ~37 unsized `<img>` and 2
  malformed `src="  https://…"`~~ ✅; ~~5 award images missing `f_auto` (served as
  raw JPEG, not WebP/AVIF)~~ ✅; ~~stale `<label for="timely">` + `</br>` typo on
  Contact~~ ✅ (found while fixing About). Still open: GA4 hardcoded on every page
  incl. `/thankyou/` `/sandbox/`; no CI, no linting, no `_headers`.
- **UPGRADE_PLAN.md §2** (deferred): Sass `@import` deprecation. Documented options:
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
   Node 24).~~ ✅ **Done** (`10ac853`). (The stale `_(uncommitted)_` markers in
   UPGRADE_PLAN.md's Done table were corrected when this file was added.)
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

**Progress (2026-09-13):** the "first task" half of item 1 is done — tokens exist
and are rendered in `sandbox.njk`. The literal-migration half of item 1, and items
2–5, are still open.

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
   **Still open:** replacing the `0.8rem`/`1rem`/`1.2rem`/`3rem`/`10px`/`4rem`/`5rem`
   literals across `layout/*`, `pages/*` and `_card.scss` with the new tokens — the
   10px nav padding has no exact token match and will need a judgment call (round
   to `--space-2xs` 8px or `--space-xs` 12.8px) when that literal is touched.
   Verified this step is a pure no-op: diffed compiled `main.css` before/after —
   only the `:root` block changed (new custom properties + `--base-url` removed),
   every byte after it is identical.
2. **De-Sass component colour logic** (the Lightning-CSS down payment):
   - [_button.scss](src/assets/scss/components/_button.scss): replace `$color-*` +
     `btnStyle()` + `darken()` with `:root` props +
     `color-mix(in oklab, var(--btn-bg), black 12%)`.
   - [_forms.scss](src/assets/scss/components/_forms.scss): replace `$formbase__*`
     hex with tokens; inline the 3 `#{$svg}` fill colours into the data-URIs; drop
     `@use "sass:math"` where `calc()` suffices.
3. **Layout objects** — new `src/assets/scss/layout/_objects.scss`: `.stack`,
   `.cluster`, `.center` (container, replaces the `<body>` `.container` utility),
   `.grid` (generalise the `.articles__list` auto-fit pattern); move `.flow` here.
   Refactor `_header.scss` / `_navigation.scss` / `_footer.scss` / `_home.scss` to
   *consume* these — additive, not a rewrite.
4. **Interleave include-media removal.** In each partial you touch, swap
   `@include media(">=sm"|">=md"|">=lg"|"<=lg")` for a plain `@media` block (only ~5
   distinct conditions, 576/768/992 px). Delete
   [_responsive.scss](src/assets/scss/base/_responsive.scss) (587 lines) in Phase 4
   once the last call site is gone.
5. **Turn [sandbox.njk](src/pages/sandbox.njk) into a real style guide:**
   ~~token swatches (spacing bars, radii, shadow)~~ ✅ — a "Tokens" section now
   renders every `--space-*`/`--radius-*` swatch, the `--shadow-1` sample,
   `--color-heading`, and a `--measure`-constrained paragraph. **Still open:**
   colour swatches, card, pricing-card, form, gallery tile, and the **prose
   specimen** (h2–h4, p, ul/ol, blockquote, `pre`, `figure`, `hr`, `table`) that
   Phase 2 styles. This is the one-screen reskin QA surface.

**First task:** add the spacing/radius/shadow/`--measure`/`--color-heading` tokens to
`_variables.scss` and render them all in `sandbox.njk`. Nothing consumes them yet —
this establishes the vocabulary. Visually a no-op except the sandbox page.

---

## Phase 2 — Blog activation

**Goal:** ship the blog on the hand-written `.njk` model.

1. **Prose CSS** in [_article.scss](src/assets/scss/pages/_article.scss) (or a
   `.prose` class on `<article>` in `article.njk`), scoped to the article body:
   h2–h4 rhythm on `--space-*` + the existing fluid `--font-size-*` scale; `ul/ol`,
   `blockquote`, `code`, `pre` (`--font-mono`, finally used), `figure`/`figcaption`,
   `hr`, `table`, in-prose `a` (underlined, distinct from the site's bare `--red`
   links), `img` (`--radius-md`). Constrain body copy to `--measure`; drop in-prose
   `p` from `--font-size-lg` to `base`/`md`. Verify against the Phase 1 specimen.
2. **Article layout parity** — rework
   [article.njk](src/_includes/layouts/article.njk): wrap in `.fh__wrapper` like
   [page.njk](src/_includes/layouts/page.njk); render a byline (date via `postDate`,
   `author` from `articles.json`); add `Article` JSON-LD to the Phase 0 meta scaffold.
3. **Draft handling** — populate `src/_11ty/filters/`, `require` from `.eleventy.js`.
   `draft: true` via `eleventyComputed` → `permalink: false` +
   `eleventyExcludeFromCollections` when `draft` and `process.env.CONTEXT === 'production'`
   (drafts preview locally / on branch deploys, never hit prod).
4. **Feed** — hand-written `src/pages/feed.njk` → `/feed.xml`, mirroring
   [sitemap.njk](src/pages/sitemap.njk). Link from `site-head.njk`
   (`<link rel="alternate" type="application/atom+xml">`). No plugin.
5. **Taxonomy + navigation** — topical tags in front matter (keep `tags: post` for
   the collection); `src/pages/tags.njk` with `pagination` → `/tags/<tag>/`; prev/next
   in `article.njk`; optional `/articles/` pagination if post count warrants.
6. **Content** — replace the 5 `my-*-article.njk` with real posts (or `git rm`
   them); replace every `via.placeholder.com` body image with a real Cloudinary URL
   (the validate script enforces this); set real dates (self-heals the 2022
   `lastmod` in the sitemap).
7. **Launch switch (last commit)** — remove `class="hidden"` from the two
   `/articles/` `<li>` in
   [header.njk](src/_includes/partials/header.njk) (mobile `menu__slide` ~line 24,
   desktop `menu__desktop` ~line 49). Until then: URLs live, unlinked.

**First task:** write the prose CSS against the sandbox specimen, convert **one** real
article, review on a branch + deploy preview.

---

## Phase 3 — Portfolio / gallery restructure

**Goal:** kill the fragile inline-JSON delivery, then add depth (per-photo pages,
series).

1. **Perf / architecture fix first (no visual change).** Convert
   [gallery.njk](src/pages/gallery.njk) and
   [home.njk](src/_includes/layouts/home.njk) to `<a>`-based PhotoSwipe markup
   (anchor per photo, `href` = full image, `data-pswp-width/height`). Removes the
   inline `| dump | safe` blob, gives a no-JS fallback and crawlable image URLs.
   Reuse [_gallery.scss](src/assets/scss/components/_gallery.scss).
2. **Schema + validation** — JSON Schema for `galleries.json`, wired into the Phase 0
   validate script (required keys, integer dims, the "every top-level key is a
   gallery" rule). Extend [docs/editing-galleries.md](docs/editing-galleries.md).
3. **Per-photo pages** — add a stable `slug` per image; `pagination` with `size: 1`
   over a flattened image collection → `/gallery/<gallery>/<slug>/` with prev/next,
   a per-photo `og:image`, and `ImageObject` JSON-LD. Style with Phase 1 layout
   objects.
4. **Series / collections** — reuse the Phase 2 tag mechanism for photo series;
   cross-link related photos.
5. **`srcset` shortcode** ($0, no dep) — a Nunjucks shortcode in
   `src/_11ty/shortcodes/` that swaps the Cloudinary `w_` param to emit
   `srcset`/`sizes`. Retrofit `about.njk`, `page-banner.njk`, article body images,
   gallery thumbs. **Not** `eleventy-img` (adds a real dependency; the site is 100%
   Cloudinary already).

**First task:** on a branch, convert `/gallery/` to `<a>`-based PhotoSwipe; confirm
the inline blob is gone from built HTML, the 4 lightboxes still open, and it works
with JS disabled. Deploy-preview, then do `home.njk`.

---

## Phase 4 — Sass → Lightning CSS + tooling / CI

**Goal:** finish the toolchain move once the reskin has settled. Phases 1–3 already
removed `darken()`/`lighten()`, moved component colours to custom props +
`color-mix()`, and replaced most `@include media()` — so UPGRADE_PLAN §2 Option 2·CSS
is now far smaller than its ~1-day estimate.

1. **`lightningcss-cli` swap** (pin exact): `main.scss` `@import` list → one entry
   point inlined by Lightning CSS; delete `_responsive.scss` + `_functions.scss`;
   expand remaining static mixins to plain CSS; vendor the PhotoSwipe `.css`
   cross-import into `scss/vendors/`; `package.json` script
   `sass … ` → `lightningcss --bundle --minify --targets '>= 0.25%' … -o public/css/main.css`.
2. **Fallback if appetite is low:** UPGRADE_PLAN §2 Option A — `sass@latest` +
   `--silence-deprecation=…`. ~15 min.
3. **Tooling / CI** (deferred to here so Phase 1–3 churn doesn't fight a linter):
   `.editorconfig`, Prettier + Stylelint configs (dev deps, $0), a real pre-commit
   hook, and a minimal GitHub Actions workflow (free for public repos) running
   `npm run build` + validate on push — a second gate before Netlify.

**QA:** dedicated branch; byte-compare `public/css/main.css` where possible, else
page-by-page visual QA against the sandbox. Keep the `sass` pipeline on `main` until
the branch passes, then swap in one commit.

---

## Anytime items (low coupling — pull when convenient)

- **GA4 consent + scope** — `G-BFJXSFY8R8` is hardcoded in `site-head.njk` on every
  page incl. `/thankyou/` `/sandbox/`. Move to a partial excluded on those routes;
  add a minimal vanilla consent gate (AU/EU).
- **`src/_11ty/*` extension pattern** — establish once (each subdir an index
  `require`d by `.eleventy.js`); first consumers are the P0 validate util, P2 draft
  filter, P3 `srcset` shortcode.
- **`prefers-reduced-motion`** — the guard is commented out in `base/_base.scss`;
  cheap to add during Phase 1.
- **Named view transitions** — `base/_base.scss` has only the default cross-fade;
  opportunistic polish after the reskin.
- **README full rewrite** (Phase 0 does the one-liner).

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
