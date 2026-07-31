import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB" | "PB";

export type FileSizeConverterInput = {
  value: number;
  from: FileSizeUnit;
  to: FileSizeUnit;
};

export type FileSizeConverterOutput = {
  result: number;
};

const UNIT_EXPONENT: Record<FileSizeUnit, number> = {
  B: 0,
  KB: 1,
  MB: 2,
  GB: 3,
  TB: 4,
  PB: 5,
};

export class FileSizeConverter extends BaseTool<
  FileSizeConverterInput,
  FileSizeConverterOutput
> {
  metadata = {
    id: "file-size-converter",
    slug: "file-size-converter",
    name: "File Size Converter",
    category: "file-tools",
    description: "Convert file sizes between bytes, KB, MB, GB, TB, and PB.",
    version: "1.0.0",
  };

  execute(
    input: FileSizeConverterInput,
    _context: ToolContext
  ): ToolResult<FileSizeConverterOutput> {
    if (input.value < 0) {
      return { success: false, data: { result: 0 }, metadata: { error: "NEGATIVE_VALUE" } };
    }

    const bytes = input.value * Math.pow(1024, UNIT_EXPONENT[input.from]);
    const result = bytes / Math.pow(1024, UNIT_EXPONENT[input.to]);

    return { success: true, data: { result }, metadata: {} };
  }
}
