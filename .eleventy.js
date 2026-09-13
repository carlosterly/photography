const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {

  eleventyConfig.setServerOptions({
    watch: ["public/css/**/*.css"]
  });

  eleventyConfig.addPassthroughCopy("./src/assets/js");
  eleventyConfig.addPassthroughCopy("./src/assets/fonts");
  eleventyConfig.addPassthroughCopy({ "./src/assets/images/favicon": "/" });

  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
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
