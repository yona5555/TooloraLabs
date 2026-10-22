/**
 * Line-level analysis for the Duplicate Line Remover, following the tool's own comparison rules: the
 * fate of every input line (kept or removed, and which line it repeats), how many lines occur once,
 * twice or more, the running count of unique lines, groups of lines that only differ by case or
 * surrounding spaces, and the unique count under each comparison mode.
 */
import { DuplicateLineRemover, type DuplicateLineRemoverInput } from "./DuplicateLineRemover";

export type LineFate = { line: string; raw: string; position: number; kept: boolean; firstPosition: number; occurrences: number };

export type DedupeAnalysis = {
  lines: LineFate[];
  blankLines: number;
  /** repeatHistogram[i] = distinct lines that occur i + 1 times (last bucket = 5 or more). */
  repeatHistogram: number[];
  /** uniqueSoFar[i] = distinct lines seen among the first i + 1 lines. */
  uniqueSoFar: number[];
  /** Groups of distinct raw lines that become one once case and surrounding spaces are ignored. */
  variantGroups: { canonical: string; variants: string[] }[];
  /** Unique counts under the three comparison modes, all computed by the tool. */
  modes: { strict: number; ignoreCase: number; ignoreCaseAndSpace: number };
  bytes: { input: number; output: number; removed: number };
};

const enc = new TextEncoder();

export function analyzeDedupe(input: DuplicateLineRemoverInput, result: string): DedupeAnalysis {
  const caseSensitive = input.caseSensitive ?? true;
  const trim = input.trimWhitespace ?? true;
  const keepLast = (input.keepOccurrence ?? "first") === "last";
  const raws = input.text.split(/\r\n|\r|\n/);
  const nonBlank = raws.map((raw) => ({ raw, line: trim ? raw.trim() : raw })).filter((x) => x.line !== "");
  const keyOf = (line: string) => (caseSensitive ? line : line.toLowerCase());

  const counts = new Map<string, number>();
  const first = new Map<string, number>();
  const last = new Map<string, number>();
  nonBlank.forEach((x, i) => {
    const k = keyOf(x.line);
    counts.set(k, (counts.get(k) ?? 0) + 1);
    if (!first.has(k)) first.set(k, i);
    last.set(k, i);
  });

  const seen = new Set<string>();
  const uniqueSoFar: number[] = [];
  const lines: LineFate[] = nonBlank.map((x, i) => {
    const k = keyOf(x.line);
    seen.add(k);
    uniqueSoFar.push(seen.size);
    return { line: x.line, raw: x.raw, position: i + 1, kept: (keepLast ? last.get(k) : first.get(k)) === i, firstPosition: (first.get(k) ?? i) + 1, occurrences: counts.get(k) ?? 1 };
  });

  const repeatHistogram = [0, 0, 0, 0, 0];
  for (const c of counts.values()) repeatHistogram[Math.min(c, 5) - 1]++;

  const groups = new Map<string, Set<string>>();
  for (const raw of raws) {
    const canonical = raw.trim().toLowerCase();
    if (!canonical) continue;
    if (!groups.has(canonical)) groups.set(canonical, new Set());
    groups.get(canonical)!.add(raw);
  }
  const variantGroups = [...groups.entries()].filter(([, v]) => v.size > 1).map(([canonical, v]) => ({ canonical, variants: [...v] }));

  const tool = new DuplicateLineRemover();
  const uniq = (o: Partial<DuplicateLineRemoverInput>) => tool.execute({ ...input, ...o }, { locale: "en-US" }).data.uniqueLines;
  const inputBytes = enc.encode(input.text).length;
  const outputBytes = enc.encode(result).length;

  return {
    lines,
    blankLines: raws.filter((r) => r.trim() === "").length,
    repeatHistogram,
    uniqueSoFar,
    variantGroups,
    modes: { strict: uniq({ caseSensitive: true, trimWhitespace: false }), ignoreCase: uniq({ caseSensitive: false, trimWhitespace: false }), ignoreCaseAndSpace: uniq({ caseSensitive: false, trimWhitespace: true }) },
    bytes: { input: inputBytes, output: outputBytes, removed: inputBytes - outputBytes },
  };
}
