/**
 * Pure logic for every JSON Formatter visual: builds a real hierarchical tree from the
 * visitor's parsed document (byte size per branch, JSON Pointer + dot path per node), lays it
 * out as a tidy, non-overlapping tree respecting collapsed branches and a visible-depth cutoff,
 * and derives the real numbers every indicator card reads (type counts, heaviest branches,
 * escape-sequence occurrences in the real formatted text). No DOM, no fabricated data.
 */
export type JSONNodeType = "object" | "array" | "string" | "number" | "boolean" | "null";

export const TYPE_TAG: Record<JSONNodeType, string> = {
  object: "{ }",
  array: "[ ]",
  string: '" "',
  number: "123",
  boolean: "t/f",
  null: "null",
};

/** Role-based colour tokens (glass-tokens.css) — one per JSON type, reused across every visual. */
export const TYPE_TOKEN: Record<JSONNodeType, string> = {
  object: "var(--cv-from)",
  array: "var(--cv-to)",
  string: "var(--cv-third)",
  number: "var(--cv-warm)",
  boolean: "var(--cv-cool)",
  null: "var(--cv-metal)",
};

export type TreeNode = {
  id: string; // JSON Pointer ("" for root)
  key: string; // display label: object key, "[i]" for an array item, "$" for root
  type: JSONNodeType;
  raw: unknown;
  preview: string;
  depth: number; // root = 0
  bytes: number; // JSON.stringify size of this value (whole subtree)
  dotPath: string; // e.g. "$.data.users[0].email"
  children: TreeNode[];
};

export function typeOf(v: unknown): JSONNodeType {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  switch (typeof v) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "object";
  }
}

function byteLength(v: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(v)).length;
  } catch {
    return 0;
  }
}

/** Real UTF-8 byte length of any string (not just a JSON-stringified value) — exported for the indicator cards that size serialised text (YAML, XML, CSV, differently-indented JSON). */
export function textByteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

function previewOf(v: unknown, type: JSONNodeType): string {
  if (type === "object") return `{${Object.keys(v as Record<string, unknown>).length}}`;
  if (type === "array") return `[${(v as unknown[]).length}]`;
  if (type === "string") {
    const s = v as string;
    return s.length > 28 ? `"${s.slice(0, 25)}…"` : `"${s}"`;
  }
  return String(v);
}

function pointerSegment(s: string): string {
  return s.replace(/~/g, "~0").replace(/\//g, "~1");
}

export function buildTree(value: unknown, key = "$", id = "", dotPath = "$", depth = 0): TreeNode {
  const type = typeOf(value);
  const children: TreeNode[] = [];
  if (type === "object") {
    for (const k of Object.keys(value as Record<string, unknown>)) {
      children.push(buildTree((value as Record<string, unknown>)[k], k, `${id}/${pointerSegment(k)}`, `${dotPath}.${k}`, depth + 1));
    }
  } else if (type === "array") {
    (value as unknown[]).forEach((item, i) => {
      children.push(buildTree(item, `[${i}]`, `${id}/${i}`, `${dotPath}[${i}]`, depth + 1));
    });
  }
  return { id, key, type, raw: value, preview: previewOf(value, type), depth, bytes: byteLength(value), dotPath, children };
}

export function maxDepthOf(node: TreeNode): number {
  let m = node.depth;
  for (const c of node.children) m = Math.max(m, maxDepthOf(c));
  return m;
}

export function countDescendants(node: TreeNode): number {
  let n = 0;
  for (const c of node.children) n += 1 + countDescendants(c);
  return n;
}

/** Pre-order flatten (root included), used for type counts, path stepping and heaviest ranking. */
export function flattenAll(node: TreeNode, out: TreeNode[] = []): TreeNode[] {
  out.push(node);
  for (const c of node.children) flattenAll(c, out);
  return out;
}

export function typeCounts(node: TreeNode): Record<JSONNodeType, number> {
  const counts: Record<JSONNodeType, number> = { object: 0, array: 0, string: 0, number: 0, boolean: 0, null: 0 };
  for (const n of flattenAll(node)) counts[n.type]++;
  return counts;
}

// ── Tidy-tree layout (collapsible, depth-cut, non-overlapping) ───────────────────────────
export type LaidNode = { node: TreeNode; x: number; y: number; hidden: number; parentId: string | null; canExpand: boolean; expanded: boolean };

export function layoutTree(root: TreeNode, collapsed: ReadonlySet<string>, maxDepth: number, rowH: number, levelW: number): { nodes: LaidNode[]; width: number; height: number } {
  const nodes: LaidNode[] = [];

  function place(node: TreeNode, yCursor: number, parentId: string | null): { height: number; midY: number } {
    const canExpand = node.children.length > 0 && node.depth < maxDepth;
    const isExpanded = canExpand && !collapsed.has(node.id);
    const entry: LaidNode = { node, x: node.depth * levelW, y: 0, hidden: 0, parentId, canExpand, expanded: isExpanded };
    nodes.push(entry);
    if (!isExpanded) {
      entry.y = yCursor + rowH / 2;
      entry.hidden = node.children.length > 0 ? countDescendants(node) : 0;
      return { height: rowH, midY: entry.y };
    }
    let cursor = yCursor;
    let firstMid = -1;
    let lastMid = -1;
    for (const child of node.children) {
      const r = place(child, cursor, node.id);
      if (firstMid < 0) firstMid = r.midY;
      lastMid = r.midY;
      cursor += r.height;
    }
    entry.y = (firstMid + lastMid) / 2;
    return { height: Math.max(rowH, cursor - yCursor), midY: entry.y };
  }

  const total = place(root, 0, null);
  const maxDepthShown = nodes.reduce((m, n) => Math.max(m, n.expanded ? n.node.depth + 1 : n.node.depth), 0);
  return { nodes, width: (maxDepthShown + 1) * levelW, height: Math.max(rowH, total.height) };
}

/** Non-root nodes ranked by their own subtree's byte size, heaviest first. */
export function heaviestNodes(root: TreeNode, limit: number): TreeNode[] {
  return flattenAll(root)
    .filter((n) => n.depth > 0)
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit);
}

// ── Sunburst rings: nodes grouped by depth, each ring's slices sized by byte share ────────
export type RingSlice = { node: TreeNode; a0: number; a1: number; frac: number };

export function sunburstRings(root: TreeNode, maxDepth: number): RingSlice[][] {
  const byDepth = new Map<number, TreeNode[]>();
  for (const n of flattenAll(root)) {
    if (n.depth === 0 || n.depth > maxDepth) continue;
    if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
    byDepth.get(n.depth)!.push(n);
  }
  const rings: RingSlice[][] = [];
  for (let d = 1; d <= maxDepth; d++) {
    const list = byDepth.get(d) ?? [];
    const total = list.reduce((s, n) => s + Math.max(1, n.bytes), 0) || 1;
    let acc = 0;
    rings.push(
      list.map((node) => {
        const frac = Math.max(1, node.bytes) / total;
        const a0 = acc;
        acc += frac;
        return { node, a0, a1: acc, frac };
      }),
    );
  }
  return rings;
}

// ── Default sample document ───────────────────────────────────────────────────────────
/**
 * The visitor sees this by default (label "Sample"), replaced the moment they type their own
 * JSON. Built as a real JS value and serialised with JSON.stringify so every escape sequence in
 * the resulting text (\n, \", \\) is the genuine output of that serialisation, not typed by hand;
 * the one \u00e9 example is injected afterwards by swapping a literal "é" for its escape text, so
 * the document also contains a real \uXXXX escape a JSON parser can decode back to "é".
 */
const SAMPLE_VALUE = {
  apiVersion: "2026-10-01",
  requestId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  success: true,
  message: null,
  meta: {
    page: 1,
    perPage: 10,
    totalPages: 7,
    rateLimit: {
      limit: 1000,
      remaining: 842,
      resetAt: "2026-10-14T18:00:00Z",
      policy: { burst: 50, windowSeconds: 3600, throttled: false },
    },
  },
  data: {
    organization: {
      id: "org_8f21",
      name: "TooloraLabs",
      plan: "enterprise",
      seats: 25,
      billing: {
        currency: "USD",
        amountCents: 499900,
        nextInvoice: "2026-11-01",
        address: {
          line1: "500 Market St",
          city: "San Francisco",
          country: "US",
          coordinates: { lat: 37.7936, lng: -122.3965 },
        },
      },
    },
    users: [
      { id: 1, name: "Ada Lovelace", email: "ada@example.com", role: "admin", active: true },
      { id: 2, name: "Grace Hopper", email: "grace@example.com", role: "editor", active: true },
      { id: 3, name: "Alan Turing", email: "alan@example.com", role: "viewer", active: false },
    ],
    tags: ["calculators", "converters", "generators", "formatters"],
  },
  description:
    "This endpoint returns a paginated snapshot of the organization's workspace, including rate-limit headers, billing details and a flattened list of active members for display in the admin dashboard.",
  changelog: "v2: renamed `owner` to `organization`.\nv1: initial release.",
  notes: 'Quote test: she said "hello" and left.\nPath: C:\\Users\\ada\\config.json\nCity: café',
  flags: { beta: false, deprecated: null, internal: true },
} as const;

export const SAMPLE_DATA: unknown = SAMPLE_VALUE;
export const SAMPLE_JSON = JSON.stringify(SAMPLE_VALUE, null, 2).replace("café", "caf\\u00e9");
export const SAMPLE_TREE: TreeNode = buildTree(SAMPLE_DATA);

// ── Format serialisers (real transformations, used by the Format Comparison card) ───────
function scalarYAML(v: unknown): string {
  if (typeof v === "string") return v === "" || /^[\s]|[\s]$|[:#\-\n"'{}[\],&*?|>@`]/.test(v) ? JSON.stringify(v) : v;
  if (v === null || v === undefined) return "null";
  return String(v);
}

function isEmptyContainer(v: unknown): boolean {
  if (Array.isArray(v)) return v.length === 0;
  if (v !== null && typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

function yamlLines(value: unknown, indent: number): string[] {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${pad}[]`];
    const out: string[] = [];
    for (const item of value) {
      if (item !== null && typeof item === "object" && !isEmptyContainer(item)) {
        const sub = yamlLines(item, indent + 1);
        out.push(`${pad}- ${sub[0].slice(pad.length + 2)}`);
        out.push(...sub.slice(1));
      } else {
        out.push(`${pad}- ${Array.isArray(item) || typeof item === "object" ? (Array.isArray(item) ? "[]" : "{}") : scalarYAML(item)}`);
      }
    }
    return out;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return [`${pad}{}`];
    const out: string[] = [];
    for (const [k, v] of entries) {
      if (v !== null && typeof v === "object" && !isEmptyContainer(v)) {
        out.push(`${pad}${k}:`);
        out.push(...yamlLines(v, indent + 1));
      } else if (Array.isArray(v)) {
        out.push(`${pad}${k}: []`);
      } else if (v !== null && typeof v === "object") {
        out.push(`${pad}${k}: {}`);
      } else {
        out.push(`${pad}${k}: ${scalarYAML(v)}`);
      }
    }
    return out;
  }
  return [`${pad}${scalarYAML(value)}`];
}

/** A readable, correctly-nested YAML rendering of `value` (block style, 2-space indent). */
export function toYAML(value: unknown): string {
  return yamlLines(value, 0).join("\n");
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const xmlSafeTag = (k: string) => (/^[A-Za-z_][\w-]*$/.test(k) ? k : "item");

function xmlLines(value: unknown, tag: string, indent: number): string[] {
  const pad = "  ".repeat(indent);
  const safeTag = xmlSafeTag(tag);
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${pad}<${safeTag} />`];
    const out: string[] = [`${pad}<${safeTag}>`];
    value.forEach((item, i) => out.push(...xmlLines(item, "item", indent + 1).map((l, li) => (li === 0 ? l.replace("<item", `<item index="${i}"`) : l))));
    out.push(`${pad}</${safeTag}>`);
    return out;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return [`${pad}<${safeTag} />`];
    const out: string[] = [`${pad}<${safeTag}>`];
    for (const [k, v] of entries) {
      if (Array.isArray(v)) {
        if (v.length === 0) out.push(`${pad}  <${xmlSafeTag(k)} />`);
        else for (const item of v) out.push(...xmlLines(item, k, indent + 1));
      } else {
        out.push(...xmlLines(v, k, indent + 1));
      }
    }
    out.push(`${pad}</${safeTag}>`);
    return out;
  }
  const text = value === null || value === undefined ? "" : xmlEscape(String(value));
  return [`${pad}<${safeTag}>${text}</${safeTag}>`];
}

/** A well-formed XML rendering of `value` under `rootTag`. */
export function toXML(value: unknown, rootTag = "root"): string {
  return [`<?xml version="1.0" encoding="UTF-8"?>`, ...xmlLines(value, rootTag, 0)].join("\n");
}

/** True only for a non-empty array whose every item is a plain object (no nested arrays/objects as values is NOT required — CSV just flattens absent fields as empty). */
export function isFlatObjectArray(v: unknown): v is Record<string, unknown>[] {
  return Array.isArray(v) && v.length > 0 && v.every((item) => item !== null && typeof item === "object" && !Array.isArray(item));
}

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** RFC-4180-ish CSV for a flat array of objects: union of keys as the header, in first-seen order. */
export function toCSV(rows: Record<string, unknown>[]): string {
  const cols: string[] = [];
  for (const r of rows) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
  const lines = [cols.map(csvEscape).join(","), ...rows.map((r) => cols.map((c) => csvEscape(r[c])).join(","))];
  return lines.join("\n");
}

// ── Curated real syntax-error snippets (Error Locator card) ─────────────────────────────
/** Each is fed through the real JSONFormatter parser; the locator never invents a line/column. */
export const ERROR_SAMPLES: { key: string; json: string }[] = [
  { key: "trailingComma", json: '{\n  "name": "Ada",\n  "role": "lead",\n}' },
  { key: "singleQuotes", json: "{\n  'status': \"ok\"\n}" },
  { key: "missingQuote", json: '{\n  "name: "Ada"\n}' },
  { key: "unescapedNewline", json: '{\n  "bio": "Line one\nLine two"\n}' },
  { key: "comment", json: '{\n  // internal note\n  "name": "Ada"\n}' },
];
