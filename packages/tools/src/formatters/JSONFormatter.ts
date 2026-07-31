import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type JSONFormatterMode = "format" | "minify";

export type JSONFormatterInput = {
  json: string;
  mode: JSONFormatterMode;
  indent?: number;
};

export type JSONFormatterOutput = {
  result: string;
};

export class JSONFormatter extends BaseTool<
  JSONFormatterInput,
  JSONFormatterOutput
> {
  metadata = {
    id: "json-formatter",
    slug: "json-formatter",
    name: "JSON Formatter",
    category: "developer-tools",
    description: "Format, validate, and minify JSON.",
    version: "1.0.0",
  };

  execute(
    input: JSONFormatterInput,
    _context: ToolContext
  ): ToolResult<JSONFormatterOutput> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(input.json);
    } catch (error) {
      return {
        success: false,
        data: { result: "" },
        metadata: {
          error: error instanceof Error ? error.message : "Invalid JSON",
        },
      };
    }

    const result =
      input.mode === "minify"
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, input.indent ?? 2);

    return { success: true, data: { result }, metadata: {} };
  }
}
