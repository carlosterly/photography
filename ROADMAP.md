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
- **Site-wide gaps**: no Open Graph / Twitter / canonical / JSON-LD anywhere; raw
  `{{ title }}` with no site-name suffix; empty `<meta description>` on
  `articles-index` + `sandbox`; About page has ~37 unsized `<img>` and 2 malformed
  `src="  https://…"`; GA4 hardcoded on every page incl. `/thankyou/` `/sandbox/`;
  no CI, no linting, no `_headers`.
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

1. **Repo hygiene.** Fix [README.md](README.md) ("Eleventy (v2)" → 3.1.6, CJS,
   Node 24). (The stale `_(uncommitted)_` markers in UPGRADE_PLAN.md's Done table
   were corrected when this file was added.)
2. **SEO / social meta partial** — extend
   [src/_includes/partials/site-head.njk](src/_includes/partials/site-head.njk) (or
   split a `partials/meta.njk`):
   - `<title>` → `{{ title }} · Carl Osterly Photography` (bare `/` special-cased);
     suffix from [src/_data/site.json](src/_data/site.json) `name`.
   - Open Graph (`og:title/description/type/url/image` + `image:width/height` +
     `site_name`), Twitter `summary_large_image`, `<link rel="canonical">`.
   - JSON-LD `WebSite` + `Person` on all pages (extension point for `Article` in P2,
     `ImageObject` in P3).
   - Fill empty `<meta description>` on `articles-index.njk` + `sandbox.njk`; add
     `<meta name="robots" content="noindex">` to `sandbox.njk` and `thankyou.njk`.
   - Reuse: every content page already carries `image` / `imageAlt` / `imageWidth` /
     `imageHeight` front matter — the partial reads them with a `site.json` fallback.
3. **OG-image convention.** Add `defaultImage` + `description` to `site.json`.
   Document one Cloudinary social-card recipe (`w_1200,h_630,c_fill,g_auto,f_auto,q_auto`)
   in `docs/`. The meta partial derives `og:image` from the page `image` + recipe.
4. **About-page fixes** ([src/pages/about.njk](src/pages/about.njk)): `width`/`height`
   on the ~37 lazy `<img>` (CLS); fix the 2 `src="  https://…"` leading-space URLs
   (broken in prod); fix the stale `for=` attr and `</br>` typo.
5. **Manifest / favicon cleanup.** Fill empty `name` / `short_name` in
   `src/assets/images/favicon/site.webmanifest`; drop the stale `favicon` key in
   `site.json`.
6. **Preload critical assets** in `site-head.njk`: the 3 woff2 in
   `src/assets/fonts/` (`crossorigin`) and the LCP hero (`home__banner` /
   [page-banner.njk](src/_includes/partials/page-banner.njk)).
7. **Validate step** ($0, no runtime dep). A Node script in `src/_11ty/utils/`
   (uses the empty scaffold): valid JSON for `galleries.json`, each entry has `src` +
   integer `width`/`height` + non-empty `alt`; grep built `public/` for
   `via.placeholder.com`, `http://`, `src="  ` / `href="  `. Wire it into a raw
   `.git/hooks/pre-commit` **and** the Netlify build (`netlify.toml` has no
   `[build]` block — add `command` or fold into the `package.json` `build` script).
   A failing build = no deploy: this replaces CI/PRs.

**First task:** meta partial on branch `chore/seo-meta` → `npm run build` → eyeball 5
rendered pages → deploy preview → merge.

---

## Phase 1 — Token layer + layout foundation

**Goal:** route every visual decision through `:root` custom properties + a few
layout objects, so the actual reskin is a token edit + a sandbox review, not a hunt
through 24 partials. **No intended visual change.**

1. **Expand [_variables.scss](src/assets/scss/abstracts/_variables.scss):** spacing
   scale `--space-3xs…3xl` (replace the literals — `0.8rem`, `1rem`, `1.2rem`,
   `3rem`, `10px`, `4rem`, `5rem` — across `layout/*` + `pages/*` + `_card.scss`);
   `--radius-sm/md` (reconcile button `8px` / card `0.5rem` / forms `0`); `--shadow-1`
   (from the `box-shadow` mixin); `--measure: 65ch`; `--color-heading` (headings are
   hardcoded `--mid-grey` in `_typography.scss`); z-index tokens for the nav. Delete
   the dead `--base-url` and [_functions.scss](src/assets/scss/abstracts/_functions.scss)
   (0 call sites).
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
5. **Turn [sandbox.njk](src/pages/sandbox.njk) into a real style guide:** token
   swatches (colour, spacing bars, radii, shadow), card, pricing-card, form, gallery
   tile, and a **prose specimen** (h2–h4, p, ul/ol, blockquote, `pre`, `figure`,
   `hr`, `table`) that Phase 2 styles. This is the one-screen reskin QA surface.

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
