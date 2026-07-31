import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type CsvJsonMode = "csvToJson" | "jsonToCsv";

export type CsvJsonConverterInput = {
  text: string;
  mode: CsvJsonMode;
};

export type CsvJsonConverterOutput = {
  result: string;
};

function parseCsv(text: string): string[][] {
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
    if (char === ",") {
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

function csvRowsToJson(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const [header, ...dataRows] = rows;
  return dataRows
    .filter((r) => !(r.length === 1 && r[0] === ""))
    .map((r) => {
      const obj: Record<string, string> = {};
      header.forEach((key, index) => {
        obj[key] = r[index] ?? "";
      });
      return obj;
    });
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function jsonToCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))));
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of data) {
    lines.push(headers.map((h) => escapeCsvField(String(row[h] ?? ""))).join(","));
  }
  return lines.join("\n");
}

export class CsvJsonConverter extends BaseTool<
  CsvJsonConverterInput,
  CsvJsonConverterOutput
> {
  metadata = {
    id: "csv-json-converter",
    slug: "csv-json-converter",
    name: "CSV ↔ JSON Converter",
    category: "file-tools",
    description: "Convert CSV data to JSON or JSON back to CSV.",
    version: "1.0.0",
  };

  execute(
    input: CsvJsonConverterInput,
    _context: ToolContext
  ): ToolResult<CsvJsonConverterOutput> {
    const text = input.text.trim();
    if (!text) {
      return this.fail("EMPTY_INPUT");
    }

    if (input.mode === "csvToJson") {
      const rows = parseCsv(text);
      const json = csvRowsToJson(rows);
      return {
        success: true,
        data: { result: JSON.stringify(json, null, 2) },
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
      data: { result: jsonToCsv(parsed as Record<string, unknown>[]) },
      metadata: {},
    };
  }

  private fail(error: string): ToolResult<CsvJsonConverterOutput> {
    return { success: false, data: { result: "" }, metadata: { error } };
  }
}
