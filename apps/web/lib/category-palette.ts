/**
 * Hex color palette for the decorated category/tool card header (see
 * TooloraLabs-Claude-Instructions.md §34). Distinct from category-colors.ts
 * (Tailwind-class icon badges used everywhere else in the site, e.g. docs
 * nav, breadcrumbs) — this palette is only for the decorated card header
 * background, which needs a raw hex value plus an explicit text-contrast
 * decision, not a Tailwind utility class.
 *
 * Chosen from the 30-color set below, one per category, no repeats,
 * grouped thematically where the palette allowed it (green for
 * money/business, blue for math/markets/tech, warm tones for time/health/
 * fun). `text` says whether the header needs white or dark (near-black)
 * icon/decoration text for contrast — computed from perceived luminance
 * ((R*299+G*587+B*114)/1000), dark above ~185, white at/below.
 */

export const CATEGORY_COLOR_PALETTE_30 = [
  "#8B9DC9",
  "#A8BFA0",
  "#D89B72",
  "#E8E2D0",
  "#D9A5A5",
  "#C3B1D9",
  "#8FBCB5",
  "#E8D8A0",
  "#D9865F",
  "#A8C4D9",
  "#A9AD7E",
  "#E0B4B4",
  "#8896A6",
  "#E0917A",
  "#A9D0BC",
  "#C6B29A",
  "#B6A3C7",
  "#D8C08A",
  "#92B6BF",
  "#9BAE8C",
  "#E0A876",
  "#9BADC2",
  "#B98080",
  "#9FCBC5",
  "#D8C9AF",
  "#A98CA6",
  "#C9A67E",
  "#7E9CC0",
  "#A3AFA3",
  "#E3B497",
] as const;

export type CategoryColor = { hex: string; text: "white" | "dark" };

export const categoryPalette: Record<string, CategoryColor> = {
  "financial-calculators": { hex: "#A9D0BC", text: "dark" },
  "business-finance": { hex: "#A8BFA0", text: "white" },
  "financial-markets": { hex: "#7E9CC0", text: "white" },
  math: { hex: "#8B9DC9", text: "white" },
  physics: { hex: "#C3B1D9", text: "dark" },
  chemistry: { hex: "#8FBCB5", text: "white" },
  converters: { hex: "#9BADC2", text: "white" },
  "ai-tools": { hex: "#B6A3C7", text: "white" },
  "developer-tools": { hex: "#8896A6", text: "white" },
  "file-tools": { hex: "#A8C4D9", text: "dark" },
  "text-tools": { hex: "#A98CA6", text: "white" },
  "student-productivity": { hex: "#E8D8A0", text: "dark" },
  "health-fitness": { hex: "#B98080", text: "white" },
  "date-time": { hex: "#D89B72", text: "white" },
  "fun-entertainment": { hex: "#E0B4B4", text: "dark" },
  weather: { hex: "#92B6BF", text: "white" },
  "website-tools": { hex: "#E8E2D0", text: "dark" },
  "algebra-number-theory": { hex: "#9FCBC5", text: "dark" },
  "calculus-analysis": { hex: "#A3AFA3", text: "white" },
  "probability-statistics": { hex: "#C9A67E", text: "white" },
  "geometry-coordinate-math": { hex: "#D8C9AF", text: "dark" },
};

const FALLBACK: CategoryColor = { hex: "#8B9DC9", text: "white" };

export function getCategoryPaletteColor(categorySlug: string): CategoryColor {
  return categoryPalette[categorySlug] ?? FALLBACK;
}
