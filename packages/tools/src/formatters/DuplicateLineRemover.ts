import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type DuplicateLineRemoverInput = {
  text: string;
  caseSensitive?: boolean;
  sort?: boolean;
  /** Which occurrence of a repeated line to keep. Defaults to "first". */
  keepOccurrence?: "first" | "last";
  /** Whether to trim each line before comparing/outputting. Defaults to true. */
  trimWhitespace?: boolean;
};

export type DuplicateGroup = {
  line: string;
  count: number;
};

export type DuplicateLineRemoverOutput = {
  result: string;
  totalLines: number;
  uniqueLines: number;
  removedCount: number;
  /** Lines that appeared more than once, with their total occurrence count, sorted by count descending. */
  duplicates: DuplicateGroup[];
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
    description:
      "Remove duplicate lines from a list, with a live report of exactly which lines repeated and how often.",
    version: "1.1.0",
  };

  execute(
    input: DuplicateLineRemoverInput,
    _context: ToolContext
  ): ToolResult<DuplicateLineRemoverOutput> {
    const caseSensitive = input.caseSensitive ?? true;
    const sort = input.sort ?? false;
    const keepOccurrence = input.keepOccurrence ?? "first";
    const trimWhitespace = input.trimWhitespace ?? true;

    const rawLines = input.text.split(/\r\n|\r|\n/);
    const counts = new Map<string, number>();
    const kept = new Map<string, { line: string; index: number }>();
    let totalLines = 0;
    let order = 0;

    for (const rawLine of rawLines) {
      const line = trimWhitespace ? rawLine.trim() : rawLine;
      if (line === "") continue;

      totalLines += 1;
      const key = caseSensitive ? line : line.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);

      if (keepOccurrence === "first") {
        if (!kept.has(key)) {
          kept.set(key, { line, index: order });
          order += 1;
        }
      } else {
        kept.set(key, { line, index: order });
        order += 1;
      }
    }

    let outputLines = [...kept.values()].sort((a, b) => a.index - b.index).map((v) => v.line);
    if (sort) {
      outputLines = [...outputLines].sort((a, b) => a.localeCompare(b));
    }

    const uniqueLines = kept.size;
    const removedCount = totalLines - uniqueLines;

    const duplicates: DuplicateGroup[] = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([key, count]) => ({ line: kept.get(key)!.line, count }))
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: { result: outputLines.join("\n"), totalLines, uniqueLines, removedCount, duplicates },
      metadata: {},
    };
  }
}
