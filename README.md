# carlosterly.photography

Personal photography portfolio and blog for Carl Osterly. Static site built with
[Eleventy](https://www.11ty.dev/) 3.1.6 (CJS `.eleventy.js`) and Dart Sass, deployed
on Netlify. Solo project, no CI, hobby pace — see [ROADMAP.md](ROADMAP.md) for the
active backlog and [UPGRADE_PLAN.md](UPGRADE_PLAN.md) for tech-debt notes.

## Local development

```
npm install
npm start        # Sass + Eleventy in watch mode → http://localhost:8080
npm run build    # one-off production build into public/ (Sass → Eleventy → validate)
```

Requires Node 24 (matches the Netlify build image).

## Project structure

```
src/
  _11ty/            build-time helpers (not templates) — each subdir is one concern:
                      computed/  eleventyComputed modules (e.g. draft handling)
                      schemas/   JSON Schema + the minimal interpreter that runs it
                      utils/     validate.js, run at the end of every build
  _data/            global data — galleries.json, site.json
  _includes/
    layouts/        one file per content type (page, article, home, gallery-photo, thankyou)
    partials/       shared includes (header, footer, meta, site-head, analytics, ...)
  articles/         hand-written blog posts (.njk, Eleventy front matter)
  assets/
    scss/           7-1 architecture, entry point main.scss
    fonts/ images/js  passed through as-is
  pages/            standalone pages and pagination-driven templates
    (gallery-photo.njk generates one page per photo; tags.njk one per tag)
```

Templates are Nunjucks throughout. No client-side framework — the only JS is
PhotoSwipe (galleries), the contact form's reCAPTCHA, and the analytics consent
gate (see below).

## Editing content

- **Galleries** (portrait / street / japan / art) — all in one file,
  `src/_data/galleries.json`, validated on every build against
  `src/_11ty/schemas/galleries.schema.json`. See
  **[docs/editing-galleries.md](docs/editing-galleries.md)**.
- **Blog articles** — hand-written `.njk` files in `src/articles/`, no CMS/Markdown.
  `draft: true` keeps a post out of production while still previewing it locally —
  see **[docs/drafts.md](docs/drafts.md)**.
- **Social/OG images** — any Cloudinary URL used as a page's `image` is
  automatically re-cropped to a 1200×630 social card. See
  **[docs/og-images.md](docs/og-images.md)**.

## Validation

`npm run build` ends with a validate step that fails the build (and so fails the
Netlify deploy) on a malformed `galleries.json` or an insecure/malformed URL in the
built output. See **[docs/validate.md](docs/validate.md)**.

## Analytics

Google Analytics (GA4) only loads after a visitor explicitly accepts the cookie
consent banner (`src/_includes/partials/analytics.njk`) — nothing is sent to
Google before that. The banner and script are both skipped entirely on pages with
`noAnalytics: true` in front matter (currently `/sandbox/` and `/thankyou/`).

## Deployment

Netlify auto-deploys `main` — **there is no preview gate for `main` itself.**
Anything touching a shared partial, `main.scss`, `.eleventy.js`, or `netlify.toml`
should go through a branch + Netlify deploy preview first; trivial content edits
(a new article, a gallery JSON row) can go direct. The contact form uses Netlify
Forms (reCAPTCHA + honeypot), submitting to `/thankyou/`.

## Docs index

- [docs/editing-galleries.md](docs/editing-galleries.md) — gallery data format, schema, common edits
- [docs/drafts.md](docs/drafts.md) — how `draft: true` works
- [docs/og-images.md](docs/og-images.md) — the social-card image recipe
- [docs/validate.md](docs/validate.md) — what the build-time validate step checks
- [ROADMAP.md](ROADMAP.md) — the active 12-month backlog, phase by phase
- [UPGRADE_PLAN.md](UPGRADE_PLAN.md) — tech-debt log
