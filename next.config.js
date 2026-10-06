// A static site: `next build` writes plain files to out/ for GitHub Pages.
// The Pages workflow sets NEXT_PUBLIC_BASE_PATH (e.g. /dynamix-toolbox).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

module.exports = {
  output: "export",
  basePath,
  trailingSlash: true,
  // No on-page dev indicator (it used to be the prerender badge).
  devIndicators: false,
};
