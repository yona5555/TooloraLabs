/**
 * Tool slugs with a built /docs/[slug] page, rolled out category by category
 * (see ROADMAP.md). Single source of truth shared by the [slug] route (which
 * tool to render, and which slugs are real vs. 404), the sidebar nav (which
 * links show a "Soon" badge), and the /docs index page (which tools to list
 * as already available).
 */
export const DOCUMENTED_TOOL_SLUGS = [
  "compound-interest-calculator",
  "loan-calculator",
  "affordable-loan-calculator",
  "retirement-calculator",
  "house-affordability-calculator",
  "debt-to-income-calculator",
  "mortgage-calculator",
  "percentage-calculator",
  "gcf-lcm-calculator",
  "fraction-calculator",
  "scientific-notation-converter",
  "significant-figures-calculator",
];

export function isToolDocumented(slug: string): boolean {
  return DOCUMENTED_TOOL_SLUGS.includes(slug);
}
