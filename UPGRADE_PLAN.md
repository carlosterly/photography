# Upgrade Plan

Ordered from safest to most complex.

---

## 1. Replace `npm-run-all` with `npm-run-all2`

**Risk: Very Low**

`npm-run-all` is unmaintained. `npm-run-all2` is a community fork with an identical API — no code changes required.

### Steps

```bash
npm uninstall npm-run-all
npm install --save-dev npm-run-all2
```

Verify scripts still work:

```bash
npm run build
npm start
```

---

## 2. Upgrade `sass` 1.77.8 → 1.99.0

**Risk: Low**

This is a minor/patch update. The most likely breaking change in newer Sass versions is deprecation of legacy `@import` rules in favour of `@use` / `@forward`. The project currently uses `@import`-style partials in `src/assets/scss/`.

### Steps

```bash
npm install --save-dev sass@latest
```

Run the build and check for deprecation warnings:

```bash
npm run build:sass
```

If warnings appear about `@import`, migrate partials to `@use` / `@forward`:

- Replace `@import 'abstracts/variables'` with `@use 'abstracts/variables' as *` (or a namespace).
- Repeat for all `@import` statements in `main.scss` and any partials that import others.
- Update variable/mixin references if namespacing is introduced.

Files likely affected:

- `src/assets/scss/main.scss`
- Any partial that imports another partial

---

## 3. Replace `--vh` CSS workaround with native `dvh`

**Risk: Low**

The JavaScript in `src/assets/js/home.js` manually sets a `--vh` CSS custom property to work around mobile browser viewport height bugs. The native `dvh` unit (dynamic viewport height) is now broadly supported and makes this workaround unnecessary.

### Steps

1. Remove or disable the code in `src/assets/js/home.js`:

   ```js
   // No longer needed — replaced by dvh unit in CSS
   // let vh = window.innerHeight * 0.01;
   // document.documentElement.style.setProperty('--vh', `${vh}px`);
   ```

2. Search for all uses of `var(--vh)` in the SCSS source:

   ```bash
   grep -r "\-\-vh" src/assets/scss/
   ```

3. Replace each occurrence. For example:

   ```scss
   // Before
   height: calc(var(--vh, 1vh) * 100);

   // After
   height: 100dvh;
   ```

4. Build and test across mobile viewports (Chrome DevTools device emulation is sufficient for a quick check).

---

## 4. Upgrade Eleventy 2.0.1 → 3.x

**Risk: High — requires multiple coordinated changes**

Eleventy 3 drops CommonJS support in its own codebase and expects projects to use ESM. Several APIs also changed.

### 4a. Add `luxon` as an explicit dependency

In Eleventy 2, `luxon` was bundled internally and accessible via `require("luxon")`. In Eleventy 3 it is no longer included.

```bash
npm install luxon
npm install --save-dev @types/luxon   # optional, for editor hints
```

### 4b. Convert the config file to ESM

Rename `.eleventy.js` → `eleventy.config.js` and convert to ESM syntax:

```js
// eleventy.config.js
import { DateTime } from "luxon";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/js");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");
  eleventyConfig.addPassthroughCopy({ "./src/assets/images/favicon": "/" });

  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "public",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
```

Note: `dataTemplateEngine` was removed from the return object — it is no longer a valid top-level option in Eleventy 3.

### 4c. Mark `package.json` as ESM (if needed)

If any other project scripts use `require()`, evaluate on a case-by-case basis. For a simple site like this, adding `"type": "module"` to `package.json` is the cleanest approach:

```json
"type": "module"
```

### 4d. Review `_11ty/` utility files

Check `src/_11ty/collections/`, `src/_11ty/filters/`, `src/_11ty/shortcodes/`, and `src/_11ty/utils/` for any `module.exports` / `require()` calls and convert them to ESM `export` / `import`.

### 4e. Install and test

```bash
npm install --save-dev @11ty/eleventy@latest
npm run build
npm start
```

Watch for:

- Template errors in Nunjucks layouts under `src/_includes/`
- Any filter or shortcode that relied on Eleventy 2 internals
- The dev server behaviour (Eleventy 3 ships an updated dev server)

### Reference

- [Eleventy v3 upgrade guide](https://www.11ty.dev/docs/v3-upgrade/)
- [Eleventy v3 changelog](https://github.com/11ty/eleventy/blob/main/CHANGELOG.md)
