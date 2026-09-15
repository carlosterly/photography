# Validation

`npm run build` ends with `node src/_11ty/utils/validate.js`, which checks two
things:

1. **`src/_data/galleries.json` is well-formed** — valid JSON, checked against
   [galleries.schema.json](../src/_11ty/schemas/galleries.schema.json) (every
   top-level key is a gallery object with `title`/`thumb`/`thumbAlt`/`images`;
   each image has a non-empty `src`/`alt` and integer `width`/`height`; see
   [editing-galleries.md](editing-galleries.md#schema-validation)). A hand-edit
   that breaks this fails the build immediately (`errors`, exit code 1).
2. **The built `public/**/*.{html,xml}`** doesn't contain an insecure
   `src="http://…"` / `href="http://…"`, or a leading-space
   `src="  http…`/`href="  http…` (the exact bug class fixed on the About page —
   see [ROADMAP.md](../ROADMAP.md) Phase 0 item 4). Also fatal.

A third check — `via.placeholder.com` references — is currently a **warning only**
(printed, doesn't fail the build). It flags the 5 lorem-ipsum
`src/articles/my-*-article.njk` files, which are deliberately still placeholder
content pending [ROADMAP.md](../ROADMAP.md) Phase 2 item 6 (blog content). Once
those are replaced with real posts, promote it from `warningChecks` to
`errorChecks` in `validate.js`.

## Netlify

No `netlify.toml` `[build]` block was added — Netlify's configured build command
already runs `npm run build`, which now includes validate. A failing validate
step fails the Netlify build the same way a Sass or Eleventy error would, so a
bad deploy is blocked without any extra Netlify config.
