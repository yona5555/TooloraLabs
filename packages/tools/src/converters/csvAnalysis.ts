/**
 * Table-level analysis for the CSV ↔ JSON converter, whichever direction ran: the parsed table
 * (headers + string cells), a profile of every column (inferred type, empties, distinct values,
 * numeric range, top values), delimiter evidence per line, row-length consistency, quoting, and the
 * byte cost of the same data as CSV, pretty JSON and minified JSON, with JSON's bytes broken down.
 */
import { cellValue, flattenObject, parseCsv } from "./CsvJsonConverter";

export type ColumnType = "integer" | "decimal" | "boolean" | "date" | "text" | "empty";
export const COLUMN_TYPES: ColumnType[] = ["integer", "decimal", "boolean", "date", "text", "empty"];

export type ColumnProfile = {
  name: string;
  type: ColumnType;
  filled: number;
  empty: number;
  distinct: number;
  maxLength: number;
  numeric: { min: number; max: number; mean: number } | null;
  /** Up to five most frequent values with their counts. */
  top: { value: string; count: number }[];
};

export type TableAnalysis = {
  headers: string[];
  rows: string[][];
  columns: ColumnProfile[];
  /** Number of fields on each data row (before padding to the header width). */
  rowLengths: number[];
  /** For each candidate delimiter, its count on each of the first lines of the CSV text. */
  delimiterCounts: Record<string, number[]>;
  quotedFields: number;
  sizes: { csv: number; jsonPretty: number; jsonMin: number };
  /** Minified JSON bytes split into repeated key names, values and punctuation. */
  jsonBytes: { keys: number; values: number; punctuation: number };
  lines: number;
};

const CANDIDATES = [",", ";", "\t", "|"];
const enc = new TextEncoder();
const bytes = (s: string) => enc.encode(s).length;

export function inferType(values: string[]): ColumnType {
  const v = values.filter((x) => x.trim() !== "");
  if (v.length === 0) return "empty";
  if (v.every((x) => /^-?\d+$/.test(x.trim()))) return "integer";
  if (v.every((x) => /^-?\d*\.?\d+(e[+-]?\d+)?$/i.test(x.trim()))) return "decimal";
  if (v.every((x) => /^(true|false)$/i.test(x.trim()))) return "boolean";
  if (v.every((x) => /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/.test(x.trim()))) return "date";
  return "text";
}

function profile(name: string, values: string[]): ColumnProfile {
  const type = inferType(values);
  const filledVals = values.filter((x) => x.trim() !== "");
  const counts = new Map<string, number>();
  for (const v of filledVals) counts.set(v, (counts.get(v) ?? 0) + 1);
  const nums = type === "integer" || type === "decimal" ? filledVals.map(Number) : [];
  return {
    name,
    type,
    filled: filledVals.length,
    empty: values.length - filledVals.length,
    distinct: counts.size,
    maxLength: Math.max(0, ...values.map((v) => [...v].length)),
    numeric: nums.length ? { min: Math.min(...nums), max: Math.max(...nums), mean: nums.reduce((s, n) => s + n, 0) / nums.length } : null,
    top: [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || (a.value < b.value ? -1 : 1)).slice(0, 5),
  };
}

function toCsv(headers: string[], rows: string[][], delimiter: string): string {
  const esc = (v: string) => (new RegExp(`["\\n\\r]|\\${delimiter}`).test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [headers.map(esc).join(delimiter), ...rows.map((r) => r.map(esc).join(delimiter))].join("\n");
}

function build(headers: string[], rawRows: string[][], csvText: string, delimiter: string): TableAnalysis {
  const rowLengths = rawRows.map((r) => r.length);
  const rows = rawRows.map((r) => headers.map((_, i) => r[i] ?? ""));
  const objects = rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  const jsonMin = JSON.stringify(objects);
  const keys = rows.length * headers.reduce((s, h) => s + bytes(JSON.stringify(h)), 0);
  const values = rows.reduce((s, r) => s + r.reduce((t, v) => t + bytes(JSON.stringify(v)), 0), 0);
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== "");
  return {
    headers,
    rows,
    columns: headers.map((h, i) => profile(h, rows.map((r) => r[i]))),
    rowLengths,
    delimiterCounts: Object.fromEntries(CANDIDATES.map((d) => [d, lines.slice(0, 12).map((l) => l.split(d).length - 1)])),
    quotedFields: (csvText.match(/(^|[,;\t|])"/gm) ?? []).length,
    sizes: { csv: bytes(csvText), jsonPretty: bytes(JSON.stringify(objects, null, 2)), jsonMin: bytes(jsonMin) },
    jsonBytes: { keys, values, punctuation: bytes(jsonMin) - keys - values },
    lines: lines.length,
  };
}

/** From CSV text: parse with the given delimiter, header row or generated column names. */
export function analyzeCsvText(text: string, delimiter: string, hasHeader: boolean): TableAnalysis {
  const parsed = parseCsv(text.trim(), delimiter).filter((r) => !(r.length === 1 && r[0] === ""));
  const width = Math.max(0, ...parsed.map((r) => r.length));
  const headers = hasHeader ? parsed[0] ?? [] : Array.from({ length: width }, (_, i) => `column${i + 1}`);
  return build(headers, hasHeader ? parsed.slice(1) : parsed, text.trim(), delimiter);
}

/** From a JSON array of objects: flatten like the converter does and build the equivalent CSV. */
export function analyzeJsonRecords(records: Record<string, unknown>[], delimiter: string): TableAnalysis {
  const flat = records.map((r) => flattenObject(r));
  const headers = Array.from(new Set(flat.flatMap((r) => Object.keys(r))));
  const rows = flat.map((r) => headers.map((h) => cellValue(r[h])));
  return build(headers, rows, toCsv(headers, rows, delimiter), delimiter);
}
