import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Removed "Fun & Entertainment" category and its tools: 301 to the tools index (docs to the docs index).
const LOCALE = ":locale(en|ar|es|hi|fr|de)";
const REMOVED_TOOLS = "dice-roller|love-calculator|random-quote-generator";

const nextConfig: NextConfig = {
  // A second production build beside the dev server's (e.g. a branch-vs-main comparison) sets its own folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    return [
      { source: `/${LOCALE}/tools/:slug(${REMOVED_TOOLS})`, destination: "/:locale/tools", statusCode: 301 },
      { source: `/${LOCALE}/categories/fun-entertainment`, destination: "/:locale/tools", statusCode: 301 },
      { source: `/${LOCALE}/docs/:slug(${REMOVED_TOOLS})`, destination: "/:locale/docs", statusCode: 301 },
    ];
  },
};

export default withNextIntl(nextConfig);
