// §8.6 keyword map check: for every section in data/section-keywords.json, each
// target keyword must appear in the section title and in its first paragraph
// (case-insensitive substring), and at most twice in that paragraph.
// Usage: node scripts/check-section-keywords.mjs [slug ...]
import { readFileSync } from "node:fs";

const map = JSON.parse(readFileSync(new URL("../data/section-keywords.json", import.meta.url)));
const messages = Object.fromEntries(
  map.locales.map((locale) => [locale, JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url)))]),
);
const only = process.argv.slice(2);

const lookup = (locale, path) => path.split(".").reduce((node, key) => node?.[key], messages[locale]);
const count = (text, word) => text.toLowerCase().split(word.toLowerCase()).length - 1;

let total = 0;
let passed = 0;
for (const [slug, sections] of Object.entries(map.tools)) {
  if (only.length && !only.includes(slug)) continue;
  for (const locale of map.locales) {
    let ok = 0;
    const failures = [];
    for (const section of sections) {
      const title = lookup(locale, section.title);
      const paragraph = lookup(locale, section.paragraph);
      if (typeof title !== "string" || typeof paragraph !== "string") {
        failures.push(`${section.id}: missing key`);
        continue;
      }
      const problems = section.keywords[locale].flatMap((word) => {
        const issues = [];
        if (!count(title, word)) issues.push(`"${word}" not in title`);
        const inParagraph = count(paragraph, word);
        if (!inParagraph) issues.push(`"${word}" not in paragraph`);
        if (inParagraph > 2) issues.push(`"${word}" ${inParagraph}× in paragraph`);
        return issues;
      });
      if (problems.length) failures.push(`${section.id}: ${problems.join(", ")}`);
      else ok += 1;
    }
    total += sections.length;
    passed += ok;
    console.log(`${slug} [${locale}] ${ok}/${sections.length}${failures.length ? `\n  - ${failures.join("\n  - ")}` : ""}`);
  }
}
console.log(`\nCompliance: ${passed}/${total} (${total ? ((100 * passed) / total).toFixed(1) : 0}%)`);
process.exitCode = passed === total ? 0 : 1;
