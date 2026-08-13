import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type FileNameSanitizerInput = {
  fileName: string;
  lowercase?: boolean;
  separator?: "-" | "_";
  /** Strip accents/diacritics down to plain ASCII (e.g. "café" → "cafe"). */
  transliterate?: boolean;
  /** Maximum output length in characters. Defaults to 255, the common filesystem limit. */
  maxLength?: number;
};

export type SanitizerChangeCode =
  | "DIACRITICS"
  | "ILLEGAL_CHARS"
  | "WHITESPACE"
  | "TRAILING_DOTS_SPACES"
  | "RESERVED_NAME"
  | "TRUNCATED";

export type FileNameSanitizerOutput = {
  result: string;
  changes: SanitizerChangeCode[];
};

// eslint-disable-next-line no-control-regex
const ILLEGAL_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;

// Windows reserves these device names (case-insensitively), with or without an extension.
const RESERVED_NAMES = new Set([
  "CON", "PRN", "AUX", "NUL",
  "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
]);

const DEFAULT_MAX_LENGTH = 255;

function stripDiacritics(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function sanitizePart(
  part: string,
  separator: string,
  lowercase: boolean,
  transliterate: boolean,
  changes: Set<SanitizerChangeCode>
): string {
  let value = part.trim();

  if (transliterate) {
    const stripped = stripDiacritics(value);
    if (stripped !== value) changes.add("DIACRITICS");
    value = stripped;
  }

  const withoutIllegal = value.replace(ILLEGAL_CHARS, "");
  if (withoutIllegal !== value) changes.add("ILLEGAL_CHARS");
  value = withoutIllegal;

  const withSeparators = value.replace(/\s+/g, separator);
  if (withSeparators !== value) changes.add("WHITESPACE");
  value = withSeparators;

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
    description:
      "Clean up file names for safe use across Windows, macOS, and Linux — stripping illegal characters, reserved device names, and trailing dots, with a report of exactly what changed.",
    version: "2.0.0",
  };

  execute(
    input: FileNameSanitizerInput,
    _context: ToolContext
  ): ToolResult<FileNameSanitizerOutput> {
    const raw = input.fileName.trim();
    if (!raw) {
      return { success: false, data: { result: "", changes: [] }, metadata: { error: "EMPTY_INPUT" } };
    }

    const separator = input.separator ?? "-";
    const lowercase = input.lowercase ?? true;
    const transliterate = input.transliterate ?? false;
    const maxLength = input.maxLength ?? DEFAULT_MAX_LENGTH;

    const changes = new Set<SanitizerChangeCode>();

    const lastDot = raw.lastIndexOf(".");
    const hasExtension = lastDot > 0 && lastDot < raw.length - 1;
    const base = hasExtension ? raw.slice(0, lastDot) : raw;
    const extension = hasExtension ? raw.slice(lastDot + 1) : "";

    let sanitizedBase = sanitizePart(base, separator, lowercase, transliterate, changes);
    const sanitizedExtension = extension
      ? sanitizePart(extension, separator, lowercase, transliterate, changes)
      : "";

    if (!sanitizedBase) {
      return { success: false, data: { result: "", changes: [] }, metadata: { error: "INVALID_RESULT" } };
    }

    // Windows forbids a filename ending in a dot or space; sanitizePart only trims a
    // trailing *separator*, so a base like "notes.." still needs this pass.
    const beforeTrailingTrim = sanitizedBase;
    sanitizedBase = sanitizedBase.replace(/[.\s]+$/, "");
    if (sanitizedBase !== beforeTrailingTrim) changes.add("TRAILING_DOTS_SPACES");
    if (!sanitizedBase) {
      return { success: false, data: { result: "", changes: [] }, metadata: { error: "INVALID_RESULT" } };
    }

    if (RESERVED_NAMES.has(sanitizedBase.toUpperCase())) {
      sanitizedBase = `${sanitizedBase}${separator}file`;
      changes.add("RESERVED_NAME");
    }

    let result = sanitizedExtension ? `${sanitizedBase}.${sanitizedExtension}` : sanitizedBase;

    if (result.length > maxLength) {
      const extPart = sanitizedExtension ? `.${sanitizedExtension}` : "";
      const allowedBaseLength = Math.max(1, maxLength - extPart.length);
      result = `${sanitizedBase.slice(0, allowedBaseLength)}${extPart}`;
      changes.add("TRUNCATED");
    }

    return { success: true, data: { result, changes: [...changes] }, metadata: {} };
  }
}
