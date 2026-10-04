#!/usr/bin/env node
// Verifies: (1) every translation key under tools.step-by-step-math-solver.education that exists
// in en.json is actually referenced by some component file (no orphans), (2) every t("...") /
// t(`...`) key referenced by a component actually exists in en.json (no dead references), (3) no
// two components declare overlapping/duplicate top-level education namespaces, (4) no dead files
// (every .tsx in the tool's directory is imported from somewhere within it). Exits non-zero on
// any violation.
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(import.meta.dirname, "..", "components", "tools", "step-by-step-math-solver");
const EN_JSON = path.resolve(import.meta.dirname, "..", "messages", "en.json");

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
let failures = 0;

// ---- translation key cross-check ----
const en = JSON.parse(fs.readFileSync(EN_JSON, "utf8"));
const edu = en.tools["step-by-step-math-solver"].education;

function flatten(obj, prefix = "") {
  const out = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const sub of flatten(v, key)) out.add(sub);
    } else {
      out.add(key);
    }
  }
  return out;
}
const declaredKeys = flatten(edu);

const nsPattern = /useTranslations\(\s*["'`]tools\.step-by-step-math-solver\.education\.([a-zA-Z0-9]+)["'`]\s*\)/;
const namespaceOwners = new Map(); // ns -> file
// fullKey -> { file } for every t(...) call found anywhere, already resolved to the full
// education-relative dotted path (i.e. what should match an en.json key).
const allReferencedFullKeys = new Map();
const dynamicFullPrefixes = []; // full dotted prefixes before a template ${...}, e.g. "stations"

for (const file of files) {
  const full = path.join(DIR, file);
  const src = fs.readFileSync(full, "utf8");
  const nsMatch = src.match(nsPattern);
  const ns = nsMatch ? nsMatch[1] : null;

  if (ns) {
    if (namespaceOwners.has(ns)) {
      console.error(`DUPLICATE NAMESPACE: "${ns}" is used by both ${namespaceOwners.get(ns)} and ${file}`);
      failures++;
    } else {
      namespaceOwners.set(ns, file);
    }
    for (const m of src.matchAll(/\bt\(\s*["']([a-zA-Z0-9_.]+)["']/g)) {
      allReferencedFullKeys.set(`${ns}.${m[1]}`, file);
    }
    for (const m of src.matchAll(/\bt\(\s*`([a-zA-Z0-9_.]*)\$\{/g)) {
      dynamicFullPrefixes.push(`${ns}.${m[1]}`.replace(/\.$/, ""));
    }
  }
}

// MathSolverEducation.tsx uses the PARENT namespace directly (getTranslations(".../education")),
// so its t("intro.title") calls are already fully-qualified -- no namespace prefix to add.
const eduFile = path.join(DIR, "MathSolverEducation.tsx");
const eduSrc = fs.readFileSync(eduFile, "utf8");
for (const m of eduSrc.matchAll(/\bt\(\s*["']([a-zA-Z0-9_.]+)["']/g)) {
  allReferencedFullKeys.set(m[1], "MathSolverEducation.tsx");
}

// Check every referenced key actually exists in en.json
for (const [full, file] of allReferencedFullKeys) {
  if (!declaredKeys.has(full)) {
    console.error(`DEAD REFERENCE: ${file} references "${full}" which does not exist in en.json`);
    failures++;
  }
}

// Check every declared key is referenced -- either statically, or falls under a dynamic prefix,
// or is a t.raw()-only structural key (rows/items/universities arrays) read directly in
// MathSolverEducation.tsx via t.raw(...) rather than t(...).
const rawPattern = /t\.raw\(\s*["']([a-zA-Z0-9_.]+)["']/g;
const rawKeys = new Set();
for (const m of eduSrc.matchAll(rawPattern)) rawKeys.add(m[1]);

for (const full of declaredKeys) {
  if (allReferencedFullKeys.has(full)) continue;
  if (dynamicFullPrefixes.some((p) => full.startsWith(p))) continue;
  if (rawKeys.has(full)) continue;
  // t.raw("examples.rows") covers "examples.rows" itself; per-row object keys (calculation/result)
  // inside the array aren't separate translation leaves, so skip anything nested under a raw key.
  if ([...rawKeys].some((rk) => full.startsWith(`${rk}.`))) continue;
  console.error(`ORPHAN KEY: "${full}" exists in en.json but is never referenced`);
  failures++;
}

// ---- dead file check ----
const allSrc = files.map((f) => fs.readFileSync(path.join(DIR, f), "utf8")).join("\n");
for (const file of files) {
  if (file === "MathSolverEducation.tsx" || file === "MathSolver.tsx") continue;
  const base = file.replace(/\.tsx?$/, "");
  const importedSomewhere = allSrc.includes(`"./${base}"`) || allSrc.includes(`'./${base}'`);
  if (!importedSomewhere) {
    console.error(`DEAD FILE: ${file} is not imported by anything in the directory`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`\n${failures} integrity failure(s).`);
  process.exit(1);
}
console.log(`OK — ${declaredKeys.size} translation keys, ${namespaceOwners.size} indicator namespaces, ${files.length} files, no orphans/dead references/duplicate namespaces/dead files.`);
