import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type CsvJsonMode = "csvToJson" | "jsonToCsv";
export type CsvDelimiter = "," | ";" | "\t" | "|" | "auto";

export type CsvJsonConverterInput = {
  text: string;
  mode: CsvJsonMode;
  delimiter: CsvDelimiter;
  /** CSV→JSON only: whether the first row is a header rather than data. */
  hasHeader: boolean;
};

export type CsvJsonConverterOutput = {
  result: string;
  /** The delimiter actually used — meaningful when "auto" detection ran. */
  resolvedDelimiter: string;
};

const CANDIDATE_DELIMITERS = [",", ";", "\t", "|"] as const;

/** Picks whichever candidate delimiter appears most often in the first line. */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  let best: string = ",";
  let bestCount = -1;
  for (const candidate of CANDIDATE_DELIMITERS) {
    const count = firstLine.split(candidate).length - 1;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === delimiter) {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\r") {
      i += 1;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function csvRowsToJson(rows: string[][], hasHeader: boolean): Record<string, string>[] {
  const nonEmptyRows = rows.filter((r) => !(r.length === 1 && r[0] === ""));
  if (nonEmptyRows.length === 0) return [];

  const header = hasHeader ? nonEmptyRows[0] : nonEmptyRows[0].map((_, i) => `column${i + 1}`);
  const dataRows = hasHeader ? nonEmptyRows.slice(1) : nonEmptyRows;

  return dataRows.map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((key, index) => {
      obj[key] = r[index] ?? "";
    });
    return obj;
  });
}

function escapeCsvField(value: string, delimiter: string): string {
  const specialChars = new RegExp(`["\n\r]|\\${delimiter}`);
  if (specialChars.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Flattens nested plain objects into dot-notation keys; arrays and other
 * non-plain values are left as-is for the caller to stringify into a cell,
 * since CSV has no native way to represent nested structure. */
function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flattenObject(value as Record<string, unknown>, path));
    } else {
      out[path] = value;
    }
  }
  return out;
}

function cellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function jsonToCsv(data: Record<string, unknown>[], delimiter: string): string {
  if (data.length === 0) return "";
  const flattened = data.map((row) => flattenObject(row));
  const headers = Array.from(new Set(flattened.flatMap((row) => Object.keys(row))));
  const lines = [headers.map((h) => escapeCsvField(h, delimiter)).join(delimiter)];
  for (const row of flattened) {
    lines.push(headers.map((h) => escapeCsvField(cellValue(row[h]), delimiter)).join(delimiter));
  }
  return lines.join("\n");
}

export class CsvJsonConverter extends BaseTool<CsvJsonConverterInput, CsvJsonConverterOutput> {
  metadata = {
    id: "csv-json-converter",
    slug: "csv-json-converter",
    name: "CSV ↔ JSON Converter",
    category: "file-tools",
    description: "Convert CSV data to JSON or JSON back to CSV, with delimiter detection and nested-object support.",
    version: "2.0.0",
  };

  execute(input: CsvJsonConverterInput, _context: ToolContext): ToolResult<CsvJsonConverterOutput> {
    const text = input.text.trim();
    if (!text) {
      return this.fail("EMPTY_INPUT");
    }

    const delimiter = input.delimiter === "auto" ? detectDelimiter(text) : input.delimiter;

    if (input.mode === "csvToJson") {
      const rows = parseCsv(text, delimiter);
      const json = csvRowsToJson(rows, input.hasHeader);
      return {
        success: true,
        data: { result: JSON.stringify(json, null, 2), resolvedDelimiter: delimiter },
        metadata: {},
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return this.fail("INVALID_JSON");
    }
    if (!Array.isArray(parsed)) {
      return this.fail("EXPECTED_ARRAY");
    }

    return {
      success: true,
      data: { result: jsonToCsv(parsed as Record<string, unknown>[], delimiter), resolvedDelimiter: delimiter },
      metadata: {},
    };
  }

  private fail(error: string): ToolResult<CsvJsonConverterOutput> {
    return { success: false, data: { result: "", resolvedDelimiter: "" }, metadata: { error } };
  }
}
