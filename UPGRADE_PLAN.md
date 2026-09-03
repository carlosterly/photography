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

## 2. Upgrade `sass` and address the `@import` deprecation

**Risk: Low to bump · Medium to fully migrate**

The version number is not the point — the `@import` rule is. `@import` is deprecated
as of Dart Sass 1.80 and is scheduled for **removal in Dart Sass 3.0**. Split this
into two independent pieces:

### 2a. Bump Sass (Low, quick) — set B

```bash
npm install --save-dev sass@latest
npm run build:sass
```

The build keeps working; expect `@import` / global-builtin deprecation warnings on
every compile. Ship this on its own and live with the warnings until 2b.

### 2b. Migrate `@import` → `@use` / `@forward` (Medium) — set C, separate

Not a mechanical find/replace. `@use` is **not global**: every partial that consumes a
variable, mixin, or function from `abstracts/` needs its own
`@use 'abstracts/variables' as *;` (or a namespaced import) at the top. That touches
most files under `src/assets/scss/`, not just `main.scss`.

- Use the automated migrator as the starting point:
  ```bash
  npx sass-migrator module --migrate-deps src/assets/scss/main.scss
  ```
  Then review every changed file and fix up namespacing by hand.
- **Watch the PhotoSwipe cross-import.** `main.scss` does
  `@import "../js/photoswipe/photoswipe"` — a plain `.css` file in the JS vendor
  folder loaded as a Sass partial. Plain-CSS loading behaves differently under `@use`;
  verify the PhotoSwipe styles still land in `public/css/main.css` after migration.
  Consider vendoring `photoswipe.css` into `src/assets/scss/vendors/` instead.
- Acceptance: `public/css/main.css` is byte-comparable (allowing for ordering) to the
  pre-migration output; every page still renders correctly.

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

**Risk: High — multiple coordinated changes. Do this last, as its own commit (set D).**

Eleventy 3 drops CommonJS in its own codebase and expects ESM projects. Several APIs
also changed. Running Eleventy 2 on Node 24 (current local setup) is already
unsupported territory, which is a mild independent reason to prioritise this.

### 4a. Add `luxon` as an explicit dependency

It is currently only present as a transitive dep of Eleventy 2 and disappears under
Eleventy 3.

```bash
npm install luxon
npm install --save-dev @types/luxon   # optional, editor hints
```

Surface is small: the only consumer is the `postDate` filter, used only by the
article pages.

### 4b. Convert the config to ESM

Rename `.eleventy.js` → `eleventy.config.js` and convert to ESM. (Escape hatch: if the
ESM conversion is troublesome, Eleventy 3 will still load a CommonJS config named
`.eleventy.cjs`.)

```js
// eleventy.config.js
import { DateTime } from "luxon";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/assets/js");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");
  eleventyConfig.addPassthroughCopy({ "./src/assets/images/favicon": "/" });

  eleventyConfig.addFilter("postDate", (dateObj) =>
    DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED)
  );

  return {
    dir: { input: "src", includes: "_includes", output: "public" },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
```

Deliberate changes to make during the conversion (the current `.eleventy.js` carries
cruft):

- **Drop `addPassthroughCopy("./src/assets/img")`** — that folder does not exist (the
  real one is `src/assets/images`); the rule is a silent no-op today.
- **Fix or drop the dev-server watch.** Current config has
  `setServerOptions({ watch: ["sandbox/public/css/**/*.css"] })` — a stale path that
  watches nothing. If you want `--serve` to reload when Sass recompiles, set
  `watch: ["public/css/**/*.css"]`; otherwise omit `setServerOptions` entirely.
- **Drop `dataTemplateEngine`** from the returned `dir` object — removed in
  Eleventy 3.

### 4c. Mark `package.json` as ESM

```json
"type": "module"
```

Safe here: after change-set A the only project `.js` file is the config (being
converted). `home.js` is already gone.

### 4d. Review `src/_11ty/` utility files

No-op — all four directories are empty.

### 4e. Install, test, and verify on a deploy preview

```bash
npm install --save-dev @11ty/eleventy@latest
npm run build
npm start
```

Watch for:

- Nunjucks template/layout errors under `src/_includes/`
- The `postDate` filter output on article pages
- Dev-server behaviour (Eleventy 3 ships an updated `@11ty/eleventy-dev-server`)

Then, because there are **no automated tests**:

- **Check the Netlify build's Node version** — Eleventy 3 needs Node 18+. There is no
  `.nvmrc` or `NODE_VERSION` in the repo, so it inherits Netlify's default; pin it
  (`.nvmrc` or `NODE_VERSION` env) to a supported LTS.
- Open a **Netlify deploy preview** and manually click every page, exercise the four
  gallery lightboxes and the home banner, submit the contact form to `/thankyou`.

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
| **A** | Step 3 (delete `home.js` + refs) + `package.json` cleanup (`main` field, script bin names) | ~Zero | ✅ done (`38d6b47`) |
| **B** | `sass@latest` bump, accept deprecation warnings | Low | ⬜ next |
| **C** | `@import` → `@use` / `@forward` migration via `sass-migrator` | Medium | ⬜ |
| **D** | Eleventy 2 → 3 (4a–4e), verified on a Netlify deploy preview | High | ⬜ |
