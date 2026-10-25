import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Removed "Fun & Entertainment" tools: 301 to the tools index (docs to the docs index).
const LOCALE = ":locale(en|ar|es|hi|fr|de)";
const REMOVED_TOOLS = "dice-roller|love-calculator|random-quote-generator";
const EMPTY_MATH_SUBS = "algebra-number-theory|calculus-analysis|probability-statistics|geometry-coordinate-math";

const nextConfig: NextConfig = {
  // A second production build beside the dev server's (e.g. a branch-vs-main comparison) sets its own folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Dev only: Next blocks the HMR socket and dev chunks for any host but localhost, so a phone on the
  // LAN (http://<mac-ip>:3001) never hydrates and no button responds. Allow the private LAN ranges.
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: [
      "10.*.*.*",
      "192.168.*.*",
      ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
    ],
  }),
  async redirects() {
    return [
      { source: `/${LOCALE}/tools/:slug(${REMOVED_TOOLS})`, destination: "/:locale/tools", statusCode: 301 },
      // Category pages exist only with 3+ live tools (MIN_TOOLS_FOR_CATEGORY_PAGE in data/categories.ts).
      { source: `/${LOCALE}/categories/:slug(${EMPTY_MATH_SUBS})`, destination: "/:locale/categories/math", statusCode: 301 },
      { source: `/${LOCALE}/categories/:slug(website-tools|fun-entertainment)`, destination: "/:locale/coming-soon", statusCode: 301 },
      { source: `/${LOCALE}/categories/weather`, destination: "/:locale/tools/weather-forecast", statusCode: 301 },
      { source: `/${LOCALE}/docs/:slug(${REMOVED_TOOLS})`, destination: "/:locale/docs", statusCode: 301 },
    ];
  },
};

export default withNextIntl(nextConfig);
