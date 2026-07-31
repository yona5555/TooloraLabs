import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type DuplicateLineRemoverInput = {
  text: string;
  caseSensitive?: boolean;
  sort?: boolean;
};

export type DuplicateLineRemoverOutput = {
  result: string;
  removedCount: number;
};

export class DuplicateLineRemover extends BaseTool<
  DuplicateLineRemoverInput,
  DuplicateLineRemoverOutput
> {
  metadata = {
    id: "duplicate-line-remover",
    slug: "duplicate-line-remover",
    name: "Duplicate Line Remover",
    category: "file-tools",
    description: "Remove duplicate lines from a list or file's text content.",
    version: "1.0.0",
  };

  execute(
    input: DuplicateLineRemoverInput,
    _context: ToolContext
  ): ToolResult<DuplicateLineRemoverOutput> {
    const caseSensitive = input.caseSensitive ?? true;
    const sort = input.sort ?? false;

    const lines = input.text.split(/\r\n|\r|\n/);
    const seen = new Set<string>();
    const output: string[] = [];
    let removedCount = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === "") continue;

      const key = caseSensitive ? line : line.toLowerCase();
      if (seen.has(key)) {
        removedCount += 1;
        continue;
      }
      seen.add(key);
      output.push(line);
    }

    if (sort) {
      output.sort((a, b) => a.localeCompare(b));
    }

    return {
      success: true,
      data: { result: output.join("\n"), removedCount },
      metadata: {},
    };
  }
}
