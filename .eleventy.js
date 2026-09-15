const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {

  eleventyConfig.setServerOptions({
    watch: ["public/css/**/*.css"]
  });

  eleventyConfig.addGlobalData("eleventyComputed", require("./src/_11ty/computed/draft.js"));

  eleventyConfig.addPassthroughCopy("./src/assets/js");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");
  eleventyConfig.addPassthroughCopy({ "./src/assets/images/favicon": "/" });

  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  // Adjacent-post lookup for article.njk's prev/next nav. `collection` is
  // sorted ascending by date, so "previous" = published before (older),
  // "next" = published after (newer).
  eleventyConfig.addFilter("previousPost", (collection, url) => {
    const index = collection.findIndex((item) => item.url === url);
    return index > 0 ? collection[index - 1] : null;
  });

  eleventyConfig.addFilter("nextPost", (collection, url) => {
    const index = collection.findIndex((item) => item.url === url);
    return index !== -1 && index < collection.length - 1 ? collection[index + 1] : null;
  });

  // Social-card recipe (docs/og-images.md): re-crop any Cloudinary URL to a
  // consistent 1200x630 og:image, replacing whatever transformation (if any)
  // the source image already carries.
  eleventyConfig.addFilter("ogImage", (url) => {
    if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
      return url;
    }
    return url.replace(/\/upload\/(?:[a-z0-9]+_[^/]+\/)*/i, "/upload/c_fill,g_auto,w_1200,h_630,f_auto,q_auto/");
  });

  // Distinct topical tags across posts, excluding the "post" tag itself
  // (that one just marks collection membership, set via articles.json).
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = new Set();
    collectionApi.getFilteredByTag("post").forEach((post) => {
      (post.data.tags || []).forEach((tag) => {
        if (tag !== "post") tags.add(tag);
      });
    });
    return [...tags].sort();
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
};
