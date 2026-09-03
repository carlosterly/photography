# carlosterly.photography

Personal photography portfolio. Built with [Eleventy](https://www.11ty.dev/) (v2) and
Dart Sass, deployed on Netlify.

## Local development

```
npm install
npm start        # Sass + Eleventy in watch mode → http://localhost:8080
npm run build    # one-off production build into public/
```

- Source: `src/`
- Build output: `public/` (gitignored)
- Templates: Nunjucks (`src/_includes/`), pages in `src/pages/`
- Styles: SCSS (`src/assets/scss/`, 7-1 architecture), entry `main.scss`

## Editing galleries

All image gallery content (portrait, street, japan, art) is in one file,
`src/_data/galleries.json`. To add, remove, or reorder images, or change a cover tile
or the home-page hero image, see **[docs/editing-galleries.md](docs/editing-galleries.md)**.
