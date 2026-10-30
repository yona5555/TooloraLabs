#!/usr/bin/env node
// Writes the exact pages one shard must measure, as scripts/ratchet.mjs expects them in MEASURED: the same slice of
// the same list that site-audit.mjs / perf-budget.mjs take (scripts/lib/shard-pages.mjs), one per line. The pages
// in affected-pages.txt already carry their locale.
// Usage: node scripts/expand-measured-pages.mjs <site-audit|perf-budget> <affected-pages.txt> <i/n> <out-file>
import { readFileSync, writeFileSync } from "node:fs";
import { shardPages } from "./lib/shard-pages.mjs";

const [kind, pagesFile, shard, outFile] = process.argv.slice(2);
const pages = readFileSync(pagesFile, "utf8").split("\n").filter(Boolean);
writeFileSync(outFile, shardPages(kind, pages, shard).map((p) => p + "\n").join(""));
