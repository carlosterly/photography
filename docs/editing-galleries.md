# Editing the image galleries

All gallery content lives in a single file:

```
src/_data/galleries.json
```

Editing that one file updates every gallery on the site. The **portrait** gallery
appears on both the home page (`/`) and the gallery page (`/gallery/`); **street**,
**japan**, and **art** appear on `/gallery/` only.

After any edit, rebuild:

```
npm run build      # one-off build
npm start          # local dev server with live reload at http://localhost:8080
```

---

## File structure

```jsonc
{
  "portrait": {
    "title": "Portrait",                        // caption under the tile on /gallery/
    "thumb": "https://res.cloudinary.com/.../f_auto,w_1000/.../Beth-Piano-1-PNG-Final.png",
    "thumbAlt": "Portrait of Beth",             // alt text for the tile image
    "banner": "https://res.cloudinary.com/.../f_auto/.../Marcelle-Portrait-1-14092019.jpg",
    "bannerAlt": "Marcelle",                    // portrait only: the big home-page hero image
    "bannerWidth": 2048,
    "bannerHeight": 1365,
    "images": [
      {
        "src": "https://res.cloudinary.com/.../f_auto/.../Beth-Piano-1-PNG-Final.png",
        "width": 720,                           // REAL pixel size of the source image
        "height": 1080,
        "alt": "Beth"
      }
      // ... more images
    ]
  },

  "street": { "title": "Street", "thumb": "...", "thumbAlt": "...", "images": [ ... ] },
  "japan":  { "title": "Japan",  "thumb": "...", "thumbAlt": "...", "images": [ ... ] },
  "art":    { "title": "Art",    "thumb": "...", "thumbAlt": "...", "images": [ ... ] }
}
```

Only `portrait` has the `banner*` fields, because it's the only gallery shown on the
home page.

---

## Add an image

Add one object to the relevant gallery's `images` array:

```json
{
  "src": "https://res.cloudinary.com/liquidweb/image/upload/f_auto/v1699999999/photography/portraits/New-Portrait-1.jpg",
  "width": 1365,
  "height": 2048,
  "alt": "Name"
}
```

- **`src`** — the Cloudinary delivery URL. Upload the file to Cloudinary under
  `photography/<portraits|street|japan|art>/`, then copy its URL. Keep the same shape
  as the existing entries: the `f_auto` transform and the `/v<number>/` version
  segment (e.g. `.../image/upload/f_auto/v1699999999/photography/portraits/File.jpg`).
- **`width` / `height`** — the **actual pixel dimensions of the source image**.
  PhotoSwipe uses them to size each slide; wrong values cause black bars or broken
  zoom. Cloudinary's asset panel shows the dimensions, or check the file locally.
- **`alt`** — short caption / accessibility text.
- **Array order = display order.** The **first** entry is the slide the gallery opens
  on. For `portrait`, the first entry is also the home page's opening slide. Put a new
  hero shot at the top; append it to show it last.

## Remove an image

Delete its `{ ... }` object from the `images` array. If you remove the **first**
`portrait` entry, the home slideshow's opening slide changes too.

## Change a gallery's cover tile

Edit `thumb` (and `thumbAlt`) for that gallery. It's independent of `images` and uses
a `w_1000` resized Cloudinary variant.

## Change the home-page hero image

Edit `portrait.banner`, `portrait.bannerAlt`, and set `bannerWidth` / `bannerHeight`
to the new file's real pixel dimensions.

## Reorder images

Move the objects around within the `images` array. Order in the file is the order on
the page.

---

## Gotchas

- **Commas:** every object in an array needs a trailing `,` except the last one.
  A stray or missing comma is the most common mistake.
- **Valid JSON only** — no comments, no trailing commas. If the build fails with a
  JSON error, that's why. Paste the file into any JSON validator, or run
  `npx eleventy`, which reports the bad line.
- **Don't add extra top-level keys** to `galleries.json`. The templates treat every
  top-level key as a gallery, so an extra `"notes"` or `"_comment"` key would render
  a broken tile. Notes go here in this doc instead.
- **Where changes show:** `portrait` edits appear on `/` and `/gallery/`; the other
  three appear on `/gallery/` only.

---

## How it's wired (for reference)

- `src/_data/galleries.json` is an Eleventy global data file, so it's available to
  every template as `galleries`.
- `src/pages/gallery.njk` loops `galleries` to build the four tiles and one
  PhotoSwipe lightbox per gallery.
- `src/_includes/layouts/home.njk` uses `galleries.portrait` for the hero image and
  the portrait slideshow.
- Both templates emit the image arrays into their inline `<script>` at build time via
  `{{ ... | dump | safe }}` — there is no runtime fetch.
