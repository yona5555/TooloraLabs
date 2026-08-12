import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";
import { findJSONSyntaxError } from "./jsonValidate";

export type JSONFormatterMode = "format" | "minify";
export type JSONIndent = 2 | 4 | "tab";

export type JSONFormatterInput = {
  json: string;
  mode: JSONFormatterMode;
  indent: JSONIndent;
  sortKeys: boolean;
};

export type JSONStats = {
  keys: number;
  depth: number;
  sizeBytes: number;
};

export type JSONFormatterOutput = {
  result: string;
  stats: JSONStats | null;
  errorMessage: string;
  errorLine: number;
  errorColumn: number;
};

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

function computeStats(value: unknown): JSONStats {
  let keys = 0;
  let maxDepth = 0;

  function walk(node: unknown, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
    } else if (node !== null && typeof node === "object") {
      for (const key of Object.keys(node as Record<string, unknown>)) {
        keys++;
        walk((node as Record<string, unknown>)[key], depth + 1);
      }
    }
  }

  walk(value, 1);
  return { keys, depth: maxDepth, sizeBytes: new TextEncoder().encode(JSON.stringify(value)).length };
}

export class JSONFormatter extends BaseTool<JSONFormatterInput, JSONFormatterOutput> {
  metadata = {
    id: "json-formatter",
    slug: "json-formatter",
    name: "JSON Formatter",
    category: "developer-tools",
    description: "Format, validate, and minify JSON, with precise line/column error reporting and key sorting.",
    version: "2.0.0",
  };

  execute(input: JSONFormatterInput, _context: ToolContext): ToolResult<JSONFormatterOutput> {
    const syntaxError = findJSONSyntaxError(input.json);
    if (syntaxError) {
      return {
        success: false,
        data: {
          result: "",
          stats: null,
          errorMessage: syntaxError.message,
          errorLine: syntaxError.line,
          errorColumn: syntaxError.column,
        },
        metadata: {},
      };
    }

    const parsed = JSON.parse(input.json);
    const value = input.sortKeys ? sortKeysDeep(parsed) : parsed;
    const indent = input.indent === "tab" ? "\t" : input.indent;

    const result = input.mode === "minify" ? JSON.stringify(value) : JSON.stringify(value, null, indent);

    return {
      success: true,
      data: { result, stats: computeStats(parsed), errorMessage: "", errorLine: 0, errorColumn: 0 },
      metadata: {},
    };
  }
}
