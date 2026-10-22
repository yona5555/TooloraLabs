/**
 * Structural analysis of a parsed JSON document, feeding every indicator of the JSON Formatter:
 * value kinds, nodes per depth, the deepest path, the byte composition of the minified text,
 * the size of each output style, key frequency, top-level member sizes and value statistics.
 * Depth follows JSONFormatter's stats: the root is depth 1, each child one level deeper.
 */

export type JSONValueKind = "object" | "array" | "string" | "number" | "boolean" | "null";

export const JSON_VALUE_KINDS: JSONValueKind[] = ["object", "array", "string", "number", "boolean", "null"];

export type JSONPathStep = { key: string; kind: JSONValueKind };

export type JSONByteComposition = {
  /** Braces, brackets, commas and colons. */
  structure: number;
  /** Object keys including their quotes. */
  keys: number;
  /** String values including their quotes and escapes. */
  strings: number;
  numbers: number;
  /** true, false and null. */
  literals: number;
  total: number;
};

export type JSONSizes = { input: number; minified: number; indent2: number; indent4: number; tab: number };

export type JSONStringBucket = { from: number; to: number | null; count: number };

export type JSONAnalysis = {
  kinds: Record<JSONValueKind, number>;
  nodes: number;
  /** depthCounts[i] = number of values at depth i + 1. */
  depthCounts: number[];
  maxDepth: number;
  /** Root-to-leaf steps of the first value found at the maximum depth (root step has key "$"). */
  deepestPath: JSONPathStep[];
  bytes: JSONByteComposition;
  sizes: JSONSizes;
  /** Every object key with its number of occurrences, most frequent first (ties alphabetical). */
  keyFrequency: { key: string; count: number }[];
  totalKeys: number;
  /** Members of the root object/array with their minified size, largest first. */
  topLevel: { key: string; kind: JSONValueKind; bytes: number }[];
  strings: { count: number; minLength: number; maxLength: number; meanLength: number; longest: string; buckets: JSONStringBucket[] };
  numbers: { count: number; integers: number; min: number; max: number; mean: number };
  arrays: { count: number; totalItems: number; maxLength: number };
  /** Lines in the 2-space formatted output. */
  formattedLines: number;
};

const STRING_BUCKETS: [number, number | null][] = [
  [0, 4],
  [5, 9],
  [10, 19],
  [20, 49],
  [50, 99],
  [100, null],
];

const encoder = new TextEncoder();

export function utf8Bytes(text: string): number {
  return encoder.encode(text).length;
}

export function kindOf(value: unknown): JSONValueKind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  return "boolean";
}

export function analyzeJSON(value: unknown, input: string): JSONAnalysis {
  const kinds: Record<JSONValueKind, number> = { object: 0, array: 0, string: 0, number: 0, boolean: 0, null: 0 };
  const depthCounts: number[] = [];
  const bytes: JSONByteComposition = { structure: 0, keys: 0, strings: 0, numbers: 0, literals: 0, total: 0 };
  const keyCounts = new Map<string, number>();
  const stringLengths: number[] = [];
  let longest = "";
  const nums: number[] = [];
  const arrays = { count: 0, totalItems: 0, maxLength: 0 };
  let maxDepth = 0;
  let deepestPath: JSONPathStep[] = [];

  function walk(node: unknown, depth: number, path: JSONPathStep[]) {
    const kind = kindOf(node);
    kinds[kind]++;
    depthCounts[depth - 1] = (depthCounts[depth - 1] ?? 0) + 1;
    if (depth > maxDepth) {
      maxDepth = depth;
      deepestPath = path;
    }
    if (kind === "array") {
      const items = node as unknown[];
      arrays.count++;
      arrays.totalItems += items.length;
      arrays.maxLength = Math.max(arrays.maxLength, items.length);
      // "[" + "]" + commas between items.
      bytes.structure += 2 + Math.max(0, items.length - 1);
      items.forEach((item, i) => walk(item, depth + 1, [...path, { key: `[${i}]`, kind: kindOf(item) }]));
    } else if (kind === "object") {
      const entries = Object.entries(node as Record<string, unknown>);
      // "{" + "}" + one colon per key + commas between entries.
      bytes.structure += 2 + entries.length + Math.max(0, entries.length - 1);
      for (const [key, child] of entries) {
        keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
        bytes.keys += utf8Bytes(JSON.stringify(key));
        walk(child, depth + 1, [...path, { key, kind: kindOf(child) }]);
      }
    } else if (kind === "string") {
      const s = node as string;
      stringLengths.push([...s].length);
      if ([...s].length > [...longest].length) longest = s;
      bytes.strings += utf8Bytes(JSON.stringify(s));
    } else if (kind === "number") {
      nums.push(node as number);
      bytes.numbers += utf8Bytes(JSON.stringify(node));
    } else {
      bytes.literals += kind === "null" ? 4 : node ? 4 : 5;
    }
  }

  walk(value, 1, [{ key: "$", kind: kindOf(value) }]);
  bytes.total = bytes.structure + bytes.keys + bytes.strings + bytes.numbers + bytes.literals;

  const indent2 = JSON.stringify(value, null, 2);
  const sizes: JSONSizes = {
    input: utf8Bytes(input),
    minified: utf8Bytes(JSON.stringify(value)),
    indent2: utf8Bytes(indent2),
    indent4: utf8Bytes(JSON.stringify(value, null, 4)),
    tab: utf8Bytes(JSON.stringify(value, null, "\t")),
  };

  const keyFrequency = [...keyCounts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  let topLevel: JSONAnalysis["topLevel"] = [];
  if (Array.isArray(value)) {
    topLevel = value.map((item, i) => ({ key: `[${i}]`, kind: kindOf(item), bytes: utf8Bytes(JSON.stringify(item)) }));
  } else if (value !== null && typeof value === "object") {
    topLevel = Object.entries(value as Record<string, unknown>).map(([key, item]) => ({ key, kind: kindOf(item), bytes: utf8Bytes(JSON.stringify(item)) }));
  }
  topLevel.sort((a, b) => b.bytes - a.bytes);

  const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

  return {
    kinds,
    nodes: sum(Object.values(kinds)),
    depthCounts,
    maxDepth,
    deepestPath,
    bytes,
    sizes,
    keyFrequency,
    totalKeys: sum([...keyCounts.values()]),
    topLevel,
    strings: {
      count: stringLengths.length,
      minLength: stringLengths.length ? Math.min(...stringLengths) : 0,
      maxLength: stringLengths.length ? Math.max(...stringLengths) : 0,
      meanLength: stringLengths.length ? sum(stringLengths) / stringLengths.length : 0,
      longest,
      buckets: STRING_BUCKETS.map(([from, to]) => ({ from, to, count: stringLengths.filter((l) => l >= from && (to === null || l <= to)).length })),
    },
    numbers: {
      count: nums.length,
      integers: nums.filter((n) => Number.isInteger(n)).length,
      min: nums.length ? Math.min(...nums) : 0,
      max: nums.length ? Math.max(...nums) : 0,
      mean: nums.length ? sum(nums) / nums.length : 0,
    },
    arrays,
    formattedLines: indent2.split("\n").length,
  };
}

/**
 * The 2-space formatted text with every container deeper than `foldDepth` collapsed to a
 * one-line summary ("{…3}" / "[…12]" = number of members hidden). foldDepth ≥ maxDepth shows all.
 */
export function foldJSON(value: unknown, foldDepth: number): string {
  function render(node: unknown, depth: number, pad: string): string {
    const kind = kindOf(node);
    if (kind !== "object" && kind !== "array") return JSON.stringify(node);
    const entries = kind === "array" ? (node as unknown[]).map((v) => [null, v] as const) : Object.entries(node as Record<string, unknown>);
    const [open, close] = kind === "array" ? ["[", "]"] : ["{", "}"];
    if (entries.length === 0) return open + close;
    if (depth > foldDepth) return `${open}…${entries.length}${close}`;
    const inner = pad + "  ";
    const lines = entries.map(([k, v]) => `${inner}${k === null ? "" : `${JSON.stringify(k)}: `}${render(v, depth + 1, inner)}`);
    return `${open}\n${lines.join(",\n")}\n${pad}${close}`;
  }
  return render(value, 1, "");
}
