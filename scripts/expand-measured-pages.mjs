#!/usr/bin/env node
// Turns a shard's slice of affected-pages.txt (locale-free paths) into the locale-prefixed page list
// scripts/ratchet.mjs expects as MEASURED: every page site-audit.mjs / perf-budget.mjs actually visited this
// run, in both LOCALES (default en,ar), one per line.
// Usage: node scripts/expand-measured-pages.mjs <affected-pages.txt> <out-file>  (env LOCALES=en,ar)
import { readFileSync, writeFileSync } from "node:fs";

const [pagesFile, outFile] = process.argv.slice(2);
const locales = (process.env.LOCALES ?? "en,ar").split(",");
const paths = readFileSync(pagesFile, "utf8").split("\n").filter(Boolean);
writeFileSync(outFile, locales.flatMap((l) => paths.map((p) => `/${l}${p}`)).join("\n") + "\n");
