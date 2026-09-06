# Upgrade Plan

Ordered from safest to most complex.

Status legend: ✅ done · ⚠ partially superseded by the current repo state (see notes).

Work lands as direct commits on `main` (the change-set labels A–D below are just
logical groupings, not pull requests). Change-set A shipped in commit `38d6b47`
(merged via PR #1, merge commit `b393949`).

---

## Current state (verified 2026-09-03, after change-set A)

| Thing | State |
|---|---|
| `@11ty/eleventy` | `2.0.1` installed |
| `sass` | `1.77.8` installed |
| `luxon` | `3.5.0`, but only as a **transitive dependency of Eleventy 2** |
| `npm-run-all2` | `8.0.4` installed; scripts now call it by name (was the `npm-run-all` alias) |
| Node (local dev) | **v24.13.0** — newer than Eleventy 2 officially supports |
| `--vh` custom property in SCSS | **none** — only `min-height: 100svh` in `abstracts/_mixins.scss:2` |
| `src/assets/js/home.js` | ✅ deleted in change-set A, along with its refs in `thankyou.njk` / `home.njk` |
| `package.json` `"main"` field | ✅ removed in change-set A (pointed at a non-existent `index.js`) |
| `src/_11ty/{collections,filters,shortcodes,utils}` | all empty |
| SCSS entry | `src/assets/scss/main.scss`, legacy comma-separated `@import`, incl. `@import "../js/photoswipe/photoswipe"` |

---

## 1. ✅ Replace `npm-run-all` with `npm-run-all2`

**Risk: Very Low — DONE** (`npm-run-all2` swapped in `3810eef`; scripts updated to
call it by name in change-set A, `38d6b47`)

---

## 2. The stylesheet: upgrade Sass, or drop it entirely

**Status: deferred (Option A chosen 2026-09-06).** `sass` pinned to exact `1.77.8`
in `package.json` (caret dropped so `npm update` cannot drift it); no migration or
removal for now. The 2·SASS and 2·CSS options below stay documented for when this is
revisited — likely after set D (Eleventy 3), or when Dart Sass 3.0 has a real release
date. Nothing forces it before then: `@import` is not removed until Dart Sass 3.0.

The trigger is the `@import` deprecation: `@import` is deprecated as of Dart Sass 1.80
and is **removed in Dart Sass 3.0**. But the research below shows the project barely
uses Sass's real capabilities, so "remove Sass" is a serious alternative to
"migrate Sass".

### 2·research — what test-compiling with `sass@1.103.1` and auditing the SCSS showed

Verified 2026-09-03. Current pin is `sass@1.77.8` (held by the lockfile; `package.json`
says `^1.77.8`, so the caret already intends to float within 1.x). Building with
1.77.8 today emits **zero** warnings.

**Compiling the current SCSS with `sass@1.103.1`:** succeeds (exit 0), but:

1. **~1,950 deprecation warnings**, by type:
   | Type | Count | Where |
   |---|---|---|
   | `global-builtin` (`map-get` → `map.get`) | ~1,920 | `base/_icons.scss` — vendored Bootstrap Icons, one `map-get` per glyph |
   | `import` (`@import` → `@use`) | 5 | `main.scss` |
   | `color-functions` (`darken`/`lighten`) | ~10 | `components/_button.scss:30`; `components/_forms.scss` ×9 |
   | `if-function` (global `if()`) | 3 | `base/_responsive.scss` (media-query helper) |

   > **Update 2026-09-06:** the icons step (commit `1c8a9da`) removed the ~1,920
> `global-builtin` warnings; ~90 remain (include-media globals + `darken`/`lighten`).

The build console is unusable without
   `--silence-deprecation=import,global-builtin,color-functions,if-function` on the
   `build:sass` / `watch:sass` scripts.

2. **The compiled CSS changes.** Newer `darken()`/`lighten()` emit a different
   representation:
   ```css
   /* 1.77.8  */ .btn--success:hover { background: #308763 }
   /* 1.103.1 */ .btn--success:hover { background: rgb(18.7078934138% 53.0568124686% 38.6425339367%) }
   ```
   Every button/form hover & disabled state (~78 output fragments, all tracing to the
   ~10 `darken`/`lighten` calls) switches to verbose `rgb()`/`hsl()`. Same rendered
   colour; output ~450 bytes larger; not byte-identical.

**SCSS feature audit — what actually depends on Sass:**

| Feature | Real usage | Notes |
|---|---|---|
| `@include media(...)` | **32 call sites** | The [include-media](https://include-media.com/) library (~360 lines in `base/_responsive.scss`: string parsing, maps, `@each`/`@for`, `@if`). Only ~5 distinct conditions are ever used: `>=sm`, `>=md`, `>=lg`, `<=lg`, `>420px` — each a one-line `@media (min/max-width)`. |
| `@include btnStyle()` | 10× | `@mixin` with `@if $outline` + `darken()` |
| `@include box-shadow` / `fh-wrapper` / `responsive-iframe` / `line-clamp` | few | static, param-less snippets |
| `abstracts/_functions.scss` `asset()` / `image()` / `font()` | **0 call sites** | dead code — delete |
| `$bootstrap-icons-map` + ~1,900 `map-get` | `base/_icons.scss` | vendored Bootstrap Icons SCSS; map only looks up static `\fXXX` glyphs. A prebuilt `bootstrap-icons.min.css` is the exact compiled equivalent. |
| `#{}` interpolation | `components/_forms.scss` | empty `$prefix` → `.input`; `math.div(x,2)` inside `calc()`; `#{$svg}` colour injected into 3 inline-SVG data URIs |
| Nesting `&` | everywhere | covered by **native CSS nesting** (Baseline 2024) |
| `@import` partials (24 partials + `main.scss`) | concatenation only | needs a bundler step |

Nothing here needs Sass's programmable features for its actual output. The heavy
machinery (include-media, the icons map, the asset functions) is barely used, dead, or
replaceable with a prebuilt CSS file.

---

### Option 2·SASS — stay on Sass, upgrade it

Two sub-steps, independently shippable.

**2·SASS-a — bump + silence (set B).**

```bash
npm install --save-dev sass@latest
```

Add `--silence-deprecation=import,global-builtin,color-functions,if-function` to
`build:sass` and `watch:sass` in `package.json`. Accept the verbose-`rgb()` colour
representation in the output (visually identical). Low risk, ~15 min. Downside: now
sitting on deprecated APIs with warnings muted, plus a one-time CSS diff.

**2·SASS-b — migrate off the deprecated APIs (set C).**

`sass-migrator` is the right tool and does the high-volume work, but is a starting
point, not a finished job:

```bash
npx sass-migrator module --migrate-deps src/assets/scss/main.scss   # @import→@use, map-get→map.get (~1,920 sites)
npx sass-migrator color  --migrate-deps src/assets/scss/main.scss   # darken/lighten→color.adjust (~10 sites)
```

Then hand-work:

- **`@use` is not global** — the migrator adds explicit `@use` to dependent partials
  but tends to emit `@use "..." as *` everywhere; review namespacing.
- **PhotoSwipe cross-import** `@import "../js/photoswipe/photoswipe"` (a `.css` file
  outside the SCSS tree) — verify under `@use`, or vendor `photoswipe.css` into
  `src/assets/scss/vendors/_photoswipe.scss` and `@forward` it.
- **`base/_icons.scss` is vendored** — in-place edits are lost on re-download; prefer
  swapping to a current Bootstrap Icons release that ships `@use`, or the prebuilt CSS.
- **`if-function`** (3 calls in `base/_responsive.scss`) — no dedicated migrator;
  leave or fix by hand.
- Migrating `color.adjust()` still does **not** make the output byte-identical to the
  1.77.8 build (still emits verbose `rgb()`); only literal hex values would.
- Acceptance: `public/css/main.css` renders identically on every page (colour
  representation change expected; anything structural is a bug).

---

### Option 2·CSS — remove Sass entirely

Feasible here, and it deletes the whole `@import`→`@use` question along with the
include-media library and the ~2,000-line icons file.

**Tooling: not Vite.** Vite is a JS-app dev-server/HMR tool with a large dependency
tree and non-trivial Eleventy integration, for what is a single stylesheet. Use
**Lightning CSS** (`lightningcss-cli`) instead — one fast dependency, a near drop-in
for the `sass` CLI line:

```
lightningcss --bundle --minify --targets '>= 0.5%' src/assets/css/main.css -o public/css/main.css
```

It inlines `@import`, minifies, and **transpiles native nesting and `color-mix()` down
for older browsers**, so migrating to modern CSS syntax doesn't cost browser support.
(`esbuild` also bundles CSS `@import` if preferred; `postcss` + plugins is the heavier
older route. Reach for Vite only if you also want it to bundle/fingerprint the JS.)

**Migration path:**

1. Replace vendored `base/_icons.scss` with Bootstrap Icons' prebuilt
   `bootstrap-icons.min.css` (or subset to the ~10 icons actually used). Removes
   ~2,000 lines and ~1,920 warnings in one move — **worth doing even if Sass stays.**
2. Convert the ~24 remaining partials to plain CSS with native nesting: hand-write the
   ~32 `@media` blocks (replacing include-media), expand the 4 static mixins, rebuild
   the button variants with custom properties + `color-mix(in srgb, var(--btn) 90%, black)`,
   inline the 3 form-SVG fill colours, drop the dead `_functions.scss`.
3. Swap `sass` → `lightningcss-cli` in `package.json`; keep the
   `build:css` / `watch:css` script shape identical.
4. Eleventy and everything else unchanged.

Effort: roughly a day. Also removes one toolchain concern from the Eleventy 3 upgrade
(set D).

**Browser-support note:** native nesting + `color-mix()` are Baseline 2024; Lightning
CSS `--targets` transpiles them down, so the effective floor stays where the
`--targets` query sets it.

---

## 3. ✅ Remove the dead `--vh` viewport hack

**Risk: ~Zero — DONE in change-set A (`38d6b47`)**

The original plan called for a grep-and-replace of `var(--vh)` in SCSS, but that was
already done — no `--vh` remained in the stylesheets (the only viewport unit is
`min-height: 100svh` in `abstracts/_mixins.scss`), so the property-setting JS was pure
dead code. Change-set A:

- Deleted `src/assets/js/home.js`.
- Removed the `<script src="/assets/js/home.js"></script>` line from
  `layouts/thankyou.njk`.
- Removed the commented reference in `layouts/home.njk`.

`npm run build` verified; no CSS changes.

---

## 4. Upgrade Eleventy 2.0.1 → 3.x

**Risk: Medium — deploy-critical path, but a small config surface.** Target is the
current latest, **Eleventy 3.1.6** (`engines: node >=18`). Do this as its own commit
(set D), after the sass-pin.

### What actually changes here (verified 2026-09-06)

The project's Eleventy footprint is small, which lowers both the benefit and the risk:

| Area | Current | v3 impact |
|---|---|---|
| Config | `.eleventy.js`, CommonJS | **CJS config still works in v3** — conversion to ESM is optional, not required. Keep CJS for the smallest diff. |
| `luxon` | `require("luxon")` for `postDate`; resolves today via hoisting (v2 dep) | v3 also bundles `luxon@^3.7.2`, so it likely keeps resolving — but add it as an explicit dependency rather than rely on a transitive. |
| Templates | 100% Nunjucks, 4 layouts + 5 partials, no markdown content | same `nunjucks@3.2.x` in v3 → output should be near-identical |
| Data | `site.json`, `galleries.json`, `articles/articles.json`; no `.js` data, no `eleventyComputed`, **no `{{ }}` in data or front-matter** | `dataTemplateEngine: "njk"` is set but unused → just delete the line |
| Collections | `collections.post` (tag), `collections.all` (sitemap) | stable API, unchanged |
| Filters | `safe` / `dump` / `url` (built-in) + `postDate` (custom) | unchanged |
| Plugins / shortcodes / pagination / eleventy-img | none | v3 auto-bundles `@11ty/eleventy-plugin-bundle` (adds `{% bundle %}`) — new surface, nothing here conflicts |
| `.eleventy.js` cruft | stale `setServerOptions.watch: ["sandbox/public/css/**/*.css"]`; `addPassthroughCopy("./src/assets/img")` (folder doesn't exist) | clean up during the upgrade |
| `src/_11ty/*` | all empty | no-op |
| Node | local v24.20.0; **no `.nvmrc` / `NODE_VERSION` pin anywhere** | v3 hard-errors below Node 18 via `please-upgrade-node` |

### Pros

- **Supported runtime.** v2 officially tops out ~Node 20; local is Node 24 — already
  unsupported. v3 supports 18/20/22/24.
- **Maintenance & security** — v2 receives no further fixes.
- **Unblocks the ecosystem** — most current plugins (image optimization, RSS, …)
  require v3. Prerequisite if the CSS/JS bundling work (`eleventy-img`, a bundle step)
  is ever wanted.
- Faster builds (new globbing / dependency graph) — marginal at 14 pages / ~5 s.

### Cons / costs

- **QA with no safety net** — zero automated tests; every page + the contact form +
  the four galleries must be checked by hand.
- **Deploy-critical path** — a bad upgrade means the site does not build, unlike the
  low-stakes stylesheet work.
- **Marginal practical benefit today** — the site works, builds fast, uses no
  v3-only features. This is "stay current" hygiene.
- ~half a day including a Netlify deploy-preview round-trip.

### Risks, ranked

1. **Netlify Node version — low probability, site-down impact.** No pin exists, so
   Netlify uses its build-image default (Node ≥18 for years, so *likely* fine).
   Mitigation: add `.nvmrc` (`20` or `22`) in this change; check the site's Netlify
   build settings first.
2. **Direct-to-`main` + Netlify auto-deploy = no preview gate.** A broken build ships
   immediately. Mitigation: for this one change, either use a throwaway branch to get
   a Netlify deploy preview before merging, or verify the Netlify Node version up
   front and run a clean `npm ci && npm run build` locally.
3. **Subtle Nunjucks rendering change — low probability, medium impact.** Same
   nunjucks major, but whitespace/escaping edge cases can shift. Mitigation: diff the
   whole `public/` tree before vs. after.
4. **`postDate` / luxon fails to resolve — very low, breaks article pages only.**
   Mitigation: `npm install luxon` explicitly.
5. `netlify-plugin-minify-html` is independent of the Eleventy version — not a risk.

### Recommended path (minimal diff)

1. `npm install --save-dev @11ty/eleventy@3` and `npm install luxon`.
2. **Keep `.eleventy.js` as CommonJS.** Only edit it to:
   - delete `dataTemplateEngine: "njk"` (removed in v3, unused here);
   - delete `addPassthroughCopy("./src/assets/img")` (dead — folder doesn't exist);
   - fix `setServerOptions({ watch: [...] })` to `["public/css/**/*.css"]` so
     `--serve` reloads on Sass recompiles, or drop `setServerOptions` entirely.
3. Add `.nvmrc` (`20` or `22`) and confirm the Netlify build image's Node version.
4. `npm run build`; diff `public/` against a pre-upgrade copy; `npm start` and click
   every page, the four gallery lightboxes, the home banner, and the contact form →
   `/thankyou`.
5. Verify on a Netlify deploy preview (throwaway branch) **before** it lands on
   `main`, given auto-deploy.

Going full ESM (`eleventy.config.mjs` + `"type": "module"`) is possible but adds churn
for no functional gain here — skip it unless there's another reason.

`src/_11ty/*` are all empty — nothing to convert.

### Reference

- [Eleventy v3 upgrade guide](https://www.11ty.dev/docs/v3-upgrade/)
- [Eleventy v3 changelog](https://github.com/11ty/eleventy/blob/main/CHANGELOG.md)

---

## Miscellaneous cleanup

- ✅ `package.json` `"main": "index.js"` field removed (change-set A).
- ✅ `npm-run-all` bin calls in `package.json` scripts renamed to `npm-run-all2`
  (change-set A).
- ⬜ Run `npm audit` / refresh `package-lock.json` at some point during this work.
- ⬜ Optional, unrelated: the `@view-transition` "Transition was skipped" console
  noise (from `scss/base/_base.scss:40`) can be silenced with an `unhandledrejection`
  handler in `partials/body-close.njk` if it becomes distracting during development.

---

## Sequencing

| Set | Contents | Risk | Status |
|---|---|---|---|
| **A** | Delete `home.js` + refs; `package.json` cleanup (`main` field, script bin names) | ~Zero | ✅ done (`38d6b47`) |
| **icons** | Subset `_icons.scss` to the 5 glyphs the site uses (was the full ~2000-icon vendored set) | Low | ✅ done (`1c8a9da`) — `main.css` 98.6 KB → 25.7 KB; `sass@latest` warnings ~1,950 → ~90 |
| **sass-pin** | Pin `sass` to exact `1.77.8` (Option A — defer the stylesheet work) | ~Zero | ✅ done (`4fdcee5`) |
| **D** | Eleventy 2.0.1 → 3.1.6 — keep CJS config, add explicit `luxon`, drop dead config, add `.nvmrc`, verify on a deploy preview | Medium | ⬜ ← next |

**Stylesheet decision (section 2) — DEFERRED (Option A, 2026-09-06). When revisited, pick one branch:**

| Branch | Sets | Risk | Effort |
|---|---|---|---|
| **2·SASS** — keep Sass | **B**: `sass@latest` + `--silence-deprecation`; then **C**: `sass-migrator` (`module` + `color`) + hand-fixes | Low → Medium | ~15 min + ~½ day |
| **2·CSS** — remove Sass | Convert ~24 partials to native-nested CSS + `sass` → `lightningcss-cli` (icons swap already done) | Medium | ~1 day |

Recommended order: **A ✅ → icons ✅ → sass-pin ✅ → D → (2·SASS or 2·CSS, later)**.
