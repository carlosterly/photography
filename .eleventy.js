const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  
  eleventyConfig.setBrowserSyncConfig({
		files: './public/css/**/*.css'
  });  
  
  eleventyConfig.addPassthroughCopy("./src/assets/img");
  eleventyConfig.addPassthroughCopy("./src/assets/js");
  eleventyConfig.addPassthroughCopy({ "./src/assets/images/favicon": "/" });

  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  // const Card = require("./src/_includes/components/Card");

  // eleventyConfig.addShortcode("Card", Card);

  // eleventyConfig.addCollection("posts", function(collectionApi) {
  //   return collectionApi.getFilteredByGlob('src/blog/posts/**/*.md')
  // });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "public",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
