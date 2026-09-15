// Draft posts (front matter `draft: true`) are hidden only in production —
// they preview locally and on Netlify branch/deploy-preview builds, where
// CONTEXT is unset or "branch-deploy"/"deploy-preview", never "production".
// See docs/drafts.md.
const isHiddenDraft = (data) => data.draft && process.env.CONTEXT === "production";

module.exports = {
  permalink: (data) => (isHiddenDraft(data) ? false : data.permalink),
  eleventyExcludeFromCollections: (data) =>
    isHiddenDraft(data) ? true : data.eleventyExcludeFromCollections,
};
