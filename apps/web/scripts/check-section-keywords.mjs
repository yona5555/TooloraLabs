// §8.6 keyword map check: for every section in data/section-keywords.json, each
// target keyword must appear in the section title and in its first paragraph,
// and at most twice in that paragraph.
// Latin keywords match as a case-insensitive substring. Arabic keywords match
// word by word on normalized stems: diacritics and tatweel are ignored, أ/إ/آ/ٱ
// count as ا, ة as ه, ى as ي, and the prefixes ال/وال/بال/كال/فال/لل plus the
// common suffixes ات/ون/ين/ان/ه are stripped, so «للقرض» matches «القرض».
// Usage: node scripts/check-section-keywords.mjs [slug ...]
import { readFileSync } from "node:fs";

const map = JSON.parse(readFileSync(new URL("../data/section-keywords.json", import.meta.url)));
const messages = Object.fromEntries(
  map.locales.map((locale) => [locale, JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url)))]),
);
const only = process.argv.slice(2);

const lookup = (locale, path) => path.split(".").reduce((node, key) => node?.[key], messages[locale]);

const ARABIC = /\p{Script=Arabic}/u;
const PREFIXES = ["وال", "بال", "كال", "فال", "لل", "ال"];
const SUFFIXES = ["ات", "ون", "ين", "ان", "ه"];
// Stripping stops before the stem drops under three letters (بيان stays بيان).
const MIN_STEM = 3;

const stem = (word) => {
  let w = word;
  const prefix = PREFIXES.find((p) => w.startsWith(p) && w.length - p.length >= MIN_STEM - 1);
  if (prefix) w = w.slice(prefix.length);
  const suffix = SUFFIXES.find((s) => w.endsWith(s) && w.length - s.length >= MIN_STEM);
  if (suffix) w = w.slice(0, -suffix.length);
  return w;
};

const normalize = (text) =>
  text
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase()
    .match(/\p{Script=Arabic}+|[\p{L}\p{N}]+/gu) ?? [];

const count = (text, word) => {
  if (!ARABIC.test(word)) return text.toLowerCase().split(word.toLowerCase()).length - 1;
  // A text word matches when it contains the keyword word's stem, so any
  // attached prefix or suffix (وتقسيم, متصفحك, للأعداد) still counts.
  const needle = normalize(word).map((t) => (ARABIC.test(t) ? stem(t) : t));
  const hay = normalize(text);
  let n = 0;
  for (let i = 0; i + needle.length <= hay.length; i += 1) {
    if (needle.every((t, j) => (ARABIC.test(t) ? hay[i + j].includes(t) : hay[i + j] === t))) n += 1;
  }
  return n;
};

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
