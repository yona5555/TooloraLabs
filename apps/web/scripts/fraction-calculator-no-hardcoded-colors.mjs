// Grep-based regression test: fails if any fraction-calculator glass component (hero + 15
// indicators + GlassPrimitives.tsx) contains a literal color -- #hex, rgb()/rgba()/hsl() literals,
// or a named Tailwind color utility class. glass-tokens.css is intentionally excluded: it is the
// ONE place the math section color (§34, lib/category-palette.ts categoryPalette.math.hex) is
// defined as a CSS variable, documented as such, and every other file must consume it only
// through that variable layer.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRACTION_DIR = path.resolve(__dirname, "../components/tools/fraction-calculator");
const GLASS_DIR = path.resolve(__dirname, "../components/tool-ui/glass");

const GLASS_CARD_FILES = [
  "FractionHero.tsx",
  "FractionRingsCard.tsx",
  "FractionCommonGridCard.tsx",
  "FractionWallCard.tsx",
  "FractionAreaModelCard.tsx",
  "FractionPercentWaffleCard.tsx",
  "FractionGcdTilingCard.tsx",
  "FractionDivisionTapeCard.tsx",
  "FractionMixedNumberCard.tsx",
  "FractionLcdLadderCard.tsx",
  "FractionDecimalExpansionCard.tsx",
  "FractionEquivalentLineCard.tsx",
  "FractionContributionCard.tsx",
  "FractionBenchmarkGaugeCard.tsx",
  "FractionCrossMultiplyCard.tsx",
  "FractionSensitivityCard.tsx",
].map((f) => path.join(FRACTION_DIR, f));

const GLASS_PRIMITIVE_FILES = readdirSync(GLASS_DIR)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => path.join(GLASS_DIR, f));

const HEX_RE = /#[0-9A-Fa-f]{3,8}\b/g;
const RGB_HSL_RE = /\b(rgb|rgba|hsl|hsla)\(/g;
const NAMED_COLOR_CLASS_RE = /\b(bg|text|border|ring|from|to|via|accent|stroke|fill|decoration)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|zinc|slate|gray|neutral|stone|white|black)(-[0-9]+)?(\/[0-9]+)?\b/g;

let failures = [];

for (const file of [...GLASS_CARD_FILES, ...GLASS_PRIMITIVE_FILES]) {
  const src = readFileSync(file, "utf8");
  const rel = path.relative(path.resolve(__dirname, ".."), file);
  for (const re of [HEX_RE, RGB_HSL_RE, NAMED_COLOR_CLASS_RE]) {
    const matches = [...src.matchAll(re)];
    if (matches.length) {
      failures.push(`${rel}: found ${matches.length} literal-color match(es): ${[...new Set(matches.map((m) => m[0]))].join(", ")}`);
    }
  }
}

if (failures.length) {
  console.error("FAIL: literal colors found in fraction-calculator glass files:");
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`PASS: zero literal colors across ${GLASS_CARD_FILES.length} card files + ${GLASS_PRIMITIVE_FILES.length} glass primitive files`);
  process.exit(0);
}
