# Drafts

Add `draft: true` to an article's front matter to keep it out of the production
build while still being able to preview it.

Wired via `eleventyComputed` in
[src/_11ty/computed/draft.js](../src/_11ty/computed/draft.js), registered with
`eleventyConfig.addGlobalData("eleventyComputed", …)` in [.eleventy.js](../.eleventy.js).
It only takes effect when **both** are true:

- the page's front matter has `draft: true`
- `process.env.CONTEXT === "production"` (Netlify sets `CONTEXT` to `production`,
  `branch-deploy`, or `deploy-preview`; it's unset in a local `npm start`)

When both hold, the page gets `permalink: false` (not written to `public/`) and
`eleventyExcludeFromCollections: true` (absent from `collections.post`, so it
doesn't show on `/articles/` or `/feed.xml`). Everywhere else — local dev,
branch deploys, deploy previews — the draft builds and links normally, so it
can be reviewed before going live.

This is a global computed key, so it runs for every page, not just articles —
harmless everywhere else, since `data.draft` is only ever set on the
`src/articles/*.njk` files that opt in via `articles.json`'s cascade (or their
own front matter).
