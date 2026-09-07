# Upgrade Plan

Living doc. Completed work is logged at the bottom. The one open item is the
stylesheet (§2), deliberately deferred.

---

## Current state (2026-09-07)

| Thing | State |
|---|---|
| `@11ty/eleventy` | `3.1.6` — CJS `.eleventy.js` kept (`1afa4fa`) |
| `sass` | `1.77.8`, pinned exact (no caret) — see §2 |
| `luxon` | `3.7.2`, explicit `dependencies` entry |
| `npm-run-all2` | `8.0.4`, called by name in scripts |
| Node | local v24.20.0; repo `.nvmrc` = `24`; Netlify build image set to 24 (UI), deploys green |
| SCSS entry | `src/assets/scss/main.scss`, legacy comma-separated `@import`, incl. `@import "../js/photoswipe/photoswipe"` |
| `_icons.scss` | subset to the 5 glyphs actually used (`1c8a9da`) |
| `src/_11ty/*` | all empty |

---

## 2. The stylesheet — upgrade Sass or drop it entirely  ·  DEFERRED (Option A)

**Decision 2026-09-06:** pin `sass` to exact `1.77.8` and leave it. No migration,
no removal. `@import` is deprecated (Dart Sass 1.80) but **not removed until Dart
Sass 3.0**, which has no release date — nothing forces a change. Revisit when 3.0 is
real, or if the stylesheet needs significant work anyway.

The two paths below stay documented for that point. Research verified 2026-09-03,
updated after the icons subset.

### Research findings

Building with `sass@1.77.8` today: **zero warnings**. Test-compiling with
`sass@1.103.1`:

- **~90 deprecation warnings** remain (was ~1,950 before `1c8a9da` removed the
  ~1,920 `map-get` calls in the vendored icons). Remainder: include-media global
  builtins in `base/_responsive.scss`, plus ~10 `darken()`/`lighten()` in
  `_button.scss` / `_forms.scss`, plus 5 `@import`, plus 3 global `if()`.
- **Compiled CSS changes**: newer `darken()`/`lighten()` emit
  `rgb(18.7% 53% 38.6%)` instead of `#308763`. Same rendered colour, ~450 B larger,
  not byte-identical. Affects every button/form hover & disabled state.

**What actually depends on Sass:**

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

### Option 2·SASS — stay on Sass

1. **Bump + silence.** `sass@latest`; add
   `--silence-deprecation=import,global-builtin,color-functions,if-function` to
   `build:sass` / `watch:sass`. Accept the verbose-`rgb()` colour output. ~15 min.
   Downside: deprecated APIs, warnings muted.
2. **Migrate.** `sass-migrator module` (`@import`→`@use`, `map-get`→`map.get`) then
   `sass-migrator color` (`darken`/`lighten`→`color.adjust`). Hand-work after:
   review `@use` namespacing across ~20 partials; handle the PhotoSwipe `.css`
   cross-import (vendor it into `scss/vendors/`); `if()` has no migrator; output
   still not byte-identical. ~½ day + visual QA.

### Option 2·CSS — remove Sass

Deletes the `@import`/`@use` question, the include-media library, and (already done)
the giant icons file.

- **Tooling: Lightning CSS** (`lightningcss-cli`), not Vite. One fast dependency,
  near drop-in for the `sass` CLI line; inlines `@import`, minifies, and transpiles
  native nesting / `color-mix()` down per `--targets` so modern syntax keeps old
  browser support. (`esbuild` also bundles CSS `@import`; Vite only if you also want
  JS bundling.)
- **Path:** convert the ~24 partials to plain CSS with native nesting; hand-write the
  ~15 `@media` blocks (replacing include-media); expand the 4 static mixins; rebuild
  button/form colours with custom properties + `color-mix()`; inline the 3 form-SVG
  fill colours; delete the dead `_functions.scss`; swap `sass` → `lightningcss-cli`
  in `package.json`. Eleventy unchanged. ~1 day + page-by-page QA.

---

## Done

| Set | What | Commits |
|---|---|---|
| **A** | `npm-run-all` → `npm-run-all2` (called by name); delete unused `home.js` + the dead `--vh` hack refs; drop `package.json` `"main"` field | `3810eef`, `38d6b47` (PR #1 `b393949`) |
| **icons** | Subset vendored `_icons.scss` from ~2000 glyphs to the 5 used → `main.css` 98.6 KB → 25.7 KB; `sass@latest` warnings ~1,950 → ~90 | `1c8a9da` |
| **sass-pin** | Pin `sass` to exact `1.77.8` (Option A) | `4fdcee5` |
| **D** | Eleventy 2.0.1 → 3.1.6: kept CJS `.eleventy.js` (removed `dataTemplateEngine`, dead `./src/assets/img` passthrough, commented scaffolding; fixed `setServerOptions.watch`); `luxon` explicit dep; `package-lock.json` −1,249 lines; `.nvmrc`. Output byte-identical to v2 across the whole `public/` tree; deployed green on Netlify (Node 24). | `1afa4fa`, `85f4706`, `63ea197` |
| **audit** | `npm audit fix` (no `--force`) — patched `immutable` 4.1.0→4.3.9, `shell-quote` 1.8.3→1.10.0, `picomatch` 2.3.1→2.3.2, `js-yaml` 3.14.1→3.15.2; all semver-compatible, `package.json` untouched. `npm audit` → 0 vulnerabilities; build output byte-identical. | _(uncommitted)_ |
| **vt-noise** | Added an `unhandledrejection` handler in `partials/body-close.njk` that `preventDefault()`s the benign `AbortError: transition was skipped` from cross-document view transitions. Renders on all 12 pages. | _(uncommitted)_ |
