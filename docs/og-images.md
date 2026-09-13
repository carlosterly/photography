# Social-card (og:image) convention

Every page's `og:image` / `twitter:image` is generated automatically by the
`ogImage` Nunjucks filter (defined in [.eleventy.js](../.eleventy.js), applied in
[src/_includes/partials/meta.njk](../src/_includes/partials/meta.njk)). You don't
need to prepare a separate social-card image — the filter re-crops whatever
Cloudinary URL the page already uses.

## The recipe

```
c_fill,g_auto,w_1200,h_630,f_auto,q_auto
```

- `c_fill,g_auto` — crop to fill the frame, letting Cloudinary's content-aware
  gravity pick the focal point (faces, subject) instead of a fixed center crop.
- `w_1200,h_630` — the standard Open Graph / Twitter card size.
- `f_auto,q_auto` — format and quality negotiated per-browser (WebP/AVIF where
  supported).

The filter inserts this in place of whatever transformation segment (if any) the
source URL already has, right after `/upload/` and before the version/public-id,
so it works whether the page's `image` is a raw upload or already carries its own
`f_auto,q_30`-style transform for on-page display.

## How it's wired in

`meta.njk` does:

```njk
{%- set ogImage = (image or site.defaultImage) | ogImage -%}
...
<meta property="og:image" content="{{ ogImage }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

Non-Cloudinary URLs are passed through unchanged (the filter checks for
`res.cloudinary.com` + `/upload/` before rewriting) — irrelevant today since the
site is 100% Cloudinary, but keeps the filter safe if that ever changes.

## Adding a new page

Just set `image` in front matter as normal (a full-res or on-page-display
Cloudinary URL, same as every existing page). No `ogImage`-specific front matter
is needed — the recipe is applied automatically. If a page has no `image` at all,
`site.json`'s `defaultImage` is used instead.
