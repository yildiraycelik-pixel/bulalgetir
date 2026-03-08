const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // --- PASSTHROUGH FILE COPY (Assets) ---
  eleventyConfig.addPassthroughCopy("assets/css");
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("assets/images");
  eleventyConfig.addPassthroughCopy("assets/fonts");
  eleventyConfig.addPassthroughCopy("src/**/*.jpg");
  eleventyConfig.addPassthroughCopy("src/**/*.png");
  eleventyConfig.addPassthroughCopy("src/**/*.webp");
  eleventyConfig.addPassthroughCopy("src/**/*.svg");

  // --- WATCH TARGETS ---
  eleventyConfig.addWatchTarget("./assets/css/");
  eleventyConfig.addWatchTarget("./assets/js/");

  // --- TARİH FİLTER'ı ---
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });

  // --- SLUG FİLTER'ı ---
  eleventyConfig.addFilter("slug", (str) => {
    return str.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  });

  // --- KATEGORİ FİLTRELEME FONKSİYONLARI ---
  eleventyConfig.addFilter("altKategorilerByKategoriId", (altKategoriler, kategoriId) => {
    if (!altKategoriler) return [];
    return altKategoriler.filter(a => a.kategori_id === kategoriId);
  });

  eleventyConfig.addFilter("sonAltKategorilerByAltKategoriId", (sonAltKategoriler, altKategoriId) => {
    if (!sonAltKategoriler) return [];
    return sonAltKategoriler.filter(s => s.altkategori_id === altKategoriId);
  });

  // --- KATEGORİ SLUG FİLTERLARI ---
  eleventyConfig.addFilter("kategoriSlug", (kategoriId) => {
    const slugs = { 
      1: "elektrik", 
      2: "elektronik", 
      3: "enerji", 
      4: "mekanik", 
      5: "makineler", 
      6: "el-aletleri", 
      7: "montaj-malzemeleri", 
      8: "ev-urunleri" 
    };
    return slugs[kategoriId] || "";
  });

  eleventyConfig.addFilter("altKategoriSlug", (altKategoriId) => {
    const slugs = { 
      101: "aydinlatma", 
      102: "motorlar", 
      103: "otomasyon", 
      104: "salt-malzemeleri", 
      201: "islemciler", 
      202: "sarj-modulleri", 
      203: "guc-elemanlari", 
      204: "manyetik-ekipmanlar", 
      301: "akuler", 
      302: "piller", 
      303: "solar-paneller", 
      304: "alternatorler", 
      401: "mengeneler", 
      402: "malzeme-suruculer", 
      403: "yari-mamuller", 
      404: "yedek-parca", 
      501: "presler", 
      502: "taslamalar", 
      503: "vibrasyon-ve-kumlama", 
      504: "cnc-robotlar" 
    };
    return slugs[altKategoriId] || "";
  });

  eleventyConfig.addFilter("sonAltKategoriSlug", (sonAltKategoriId) => {
    const slugs = { 
      10101: "peyzaj-aydinlatma", 
      10102: "ic-mimari-aydinlatma", 
      10103: "endustriyel-aydinlatma", 
      10104: "mobil-aydinlatma", 
      10201: "ac-dc-motorlar", 
      10202: "servo-motorlar", 
      10203: "step-motorlar", 
      10204: "ozel-motorlar", 
      10301: "kumanda-sistemleri", 
      10302: "yol-verme-sistemleri", 
      10303: "yonlendirme-sistemleri", 
      10304: "guvenlik-sistemleri", 
      10401: "salterler", 
      10402: "devre-kesiciler", 
      10403: "topraklama-elemanlari", 
      10404: "konnektorler", 
      20101: "cpu", 
      20102: "ana-kart", 
      20103: "gpu", 
      20104: "kontrol-kart", 
      20201: "sarj-modulu-2s", 
      20202: "sarj-modulu-3s", 
      20203: "sarj-modulu-4s", 
      20204: "ozel-sarj-modulu", 
      20301: "transformator", 
      20302: "power-supply", 
      20303: "adaptor", 
      20304: "frekans-modulatorleri" 
    };
    return slugs[sonAltKategoriId] || "";
  });

  // --- SHORTCODES ---
  eleventyConfig.addShortcode("year", function() {
    return new Date().getFullYear().toString();
  });

  // --- ELEVENTY AYARLARI ---
  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    pathPrefix: "/"
  };
};
