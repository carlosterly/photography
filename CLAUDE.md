# Working in this repo

This file is for durable, task-independent conventions only — things true no
matter which piece of work is active. **Task backlog, phase progress, and
what's done/pending live in [ROADMAP.md](ROADMAP.md), not here** — don't
duplicate that here, and don't let this file grow task-specific notes.

## Workflow rules

- **Never commit without being explicitly asked.** Make edits, verify the
  build, report what changed, then stop — even if the turn started from your
  own "here's the next task" suggestion that the user replied "proceed" to.
  "Proceed" authorizes doing the work, not committing it. Only a separate,
  explicit instruction ("commit this", "commit and push") does.
- **When asked to commit: straight to `main`.** No feature branches, no PRs,
  unless explicitly asked for one. This is a solo project — that overhead is
  deliberately skipped.
- **Never push without being asked**, even if a commit was just made.
- Leave the diff staged/unstaged for review before committing — that's the
  actual point of waiting for the explicit ask, not just sequencing the git
  command last.

## Local development

```
npm install
npm start        # Sass + Eleventy in watch mode → http://localhost:8080
npm run build    # one-off production build into public/ (Sass → Eleventy → validate)
```

Requires Node 24 (matches the Netlify build image). `npm run build` ends with
a validate step (`src/_11ty/utils/validate.js`) that fails the build on a
malformed `galleries.json` or an insecure/malformed URL in the built output —
see [docs/validate.md](docs/validate.md).

## Where things live

- **[ROADMAP.md](ROADMAP.md)** — the active backlog, phase by phase, with
  progress notes. Read this first for "what's next." Phase 4 holds the
  detailed research for the one still-open tech-debt decision (Sass vs.
  Lightning CSS). Completed tech-debt work is git history, not logged in a
  doc.
- **[README.md](README.md)** — project structure overview, docs index.
- **`docs/*.md`** — one file per topic (editing galleries, drafts, OG images,
  validation). Prefer extending these over re-explaining the same thing inline
  in a commit message every time.

## Architecture facts that rarely change

- Static site: Eleventy 3.1.6 (CJS `.eleventy.js`), Nunjucks templates, Dart
  Sass (7-1 architecture, entry `main.scss`). No client-side framework.
- Deployed on Netlify, auto-deploy from `main` — **no preview gate on `main`
  itself.** Branch + Netlify deploy preview for anything touching a shared
  partial, `main.scss`, `.eleventy.js`, or `netlify.toml`; trivial content
  edits can go direct.
- Solo project, hobby pace, $0 budget, no CI, no automated tests. Prefer
  hand-rolled zero-dependency solutions over adding a new package where
  reasonable (see `src/_11ty/schemas/jsonSchema.js` for the pattern — a
  minimal purpose-built interpreter instead of pulling in `ajv`).
- All images are hosted on Cloudinary; there is no local image
  processing/optimization pipeline (deliberately — see ROADMAP.md's rejection
  of `eleventy-img`).
- `public/` is gitignored build output — never hand-edit it, and don't be
  surprised by stale files there between builds (Eleventy doesn't clean the
  output directory by default).
