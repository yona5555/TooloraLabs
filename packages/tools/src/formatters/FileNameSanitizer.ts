import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type FileNameSanitizerInput = {
  fileName: string;
  lowercase?: boolean;
  separator?: "-" | "_";
};

export type FileNameSanitizerOutput = {
  result: string;
};

// eslint-disable-next-line no-control-regex
const ILLEGAL_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;

function sanitizePart(part: string, separator: string, lowercase: boolean): string {
  let value = part.trim().replace(ILLEGAL_CHARS, "");
  value = value.replace(/\s+/g, separator);
  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  value = value.replace(new RegExp(`${escapedSeparator}{2,}`, "g"), separator);
  value = value.replace(new RegExp(`^${escapedSeparator}+|${escapedSeparator}+$`, "g"), "");
  return lowercase ? value.toLowerCase() : value;
}

export class FileNameSanitizer extends BaseTool<
  FileNameSanitizerInput,
  FileNameSanitizerOutput
> {
  metadata = {
    id: "file-name-sanitizer",
    slug: "file-name-sanitizer",
    name: "File Name Sanitizer",
    category: "file-tools",
    description: "Clean up file names for safe use across operating systems and upload systems.",
    version: "1.0.0",
  };

  execute(
    input: FileNameSanitizerInput,
    _context: ToolContext
  ): ToolResult<FileNameSanitizerOutput> {
    const raw = input.fileName.trim();
    if (!raw) {
      return { success: false, data: { result: "" }, metadata: { error: "EMPTY_INPUT" } };
    }

    const separator = input.separator ?? "-";
    const lowercase = input.lowercase ?? true;

    const lastDot = raw.lastIndexOf(".");
    const hasExtension = lastDot > 0 && lastDot < raw.length - 1;
    const base = hasExtension ? raw.slice(0, lastDot) : raw;
    const extension = hasExtension ? raw.slice(lastDot + 1) : "";

    const sanitizedBase = sanitizePart(base, separator, lowercase);
    const sanitizedExtension = extension ? sanitizePart(extension, separator, lowercase) : "";

    if (!sanitizedBase) {
      return { success: false, data: { result: "" }, metadata: { error: "INVALID_RESULT" } };
    }

    const result = sanitizedExtension ? `${sanitizedBase}.${sanitizedExtension}` : sanitizedBase;
    return { success: true, data: { result }, metadata: {} };
  }
}
