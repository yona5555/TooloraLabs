import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type Base64Mode = "encode" | "decode";
export type Base64Variant = "standard" | "urlSafe";

export type Base64ToolInput = {
  text: string;
  mode: Base64Mode;
  variant?: Base64Variant;
};

export type Base64ToolOutput = {
  result: string;
  inputBytes: number;
  outputBytes: number;
};

const STANDARD_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const URL_SAFE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function charsFor(variant: Base64Variant): string {
  return variant === "urlSafe" ? URL_SAFE_CHARS : STANDARD_CHARS;
}

export function utf8Encode(input: string): number[] {
  const bytes: number[] = [];
  for (const char of input) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return bytes;
}

export function utf8Decode(bytes: number[]): string {
  let result = "";
  let i = 0;
  while (i < bytes.length) {
    const byte1 = bytes[i];
    if (byte1 < 0x80) {
      result += String.fromCodePoint(byte1);
      i += 1;
    } else if ((byte1 & 0xe0) === 0xc0 && i + 1 < bytes.length) {
      result += String.fromCodePoint(
        ((byte1 & 0x1f) << 6) | (bytes[i + 1] & 0x3f)
      );
      i += 2;
    } else if ((byte1 & 0xf0) === 0xe0 && i + 2 < bytes.length) {
      result += String.fromCodePoint(
        ((byte1 & 0x0f) << 12) |
          ((bytes[i + 1] & 0x3f) << 6) |
          (bytes[i + 2] & 0x3f)
      );
      i += 3;
    } else if ((byte1 & 0xf8) === 0xf0 && i + 3 < bytes.length) {
      result += String.fromCodePoint(
        ((byte1 & 0x07) << 18) |
          ((bytes[i + 1] & 0x3f) << 12) |
          ((bytes[i + 2] & 0x3f) << 6) |
          (bytes[i + 3] & 0x3f)
      );
      i += 4;
    } else {
      throw new Error("Invalid UTF-8 byte sequence");
    }
  }
  return result;
}

export function bytesToBase64(bytes: number[], variant: Base64Variant = "standard"): string {
  const chars = charsFor(variant);
  const usePadding = variant === "standard";
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1];
    const b3 = bytes[i + 2];
    const triplet = (b1 << 16) | ((b2 ?? 0) << 8) | (b3 ?? 0);
    result += chars[(triplet >> 18) & 0x3f];
    result += chars[(triplet >> 12) & 0x3f];
    result += b2 !== undefined ? chars[(triplet >> 6) & 0x3f] : usePadding ? "=" : "";
    result += b3 !== undefined ? chars[triplet & 0x3f] : usePadding ? "=" : "";
  }
  return result;
}

export function base64ToBytes(base64: string, variant: Base64Variant = "standard"): number[] | null {
  const chars = charsFor(variant);
  const clean = base64.replace(/=+$/, "");

  if (variant === "standard" && base64.length % 4 !== 0) {
    return null;
  }
  if (clean.length === 0) {
    return null;
  }

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of clean) {
    const value = chars.indexOf(char);
    if (value === -1) {
      return null;
    }
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return bytes;
}

export class Base64Tool extends BaseTool<Base64ToolInput, Base64ToolOutput> {
  metadata = {
    id: "base64-tool",
    slug: "base64-tool",
    name: "Base64 Encoder/Decoder",
    category: "developer-tools",
    description:
      "Encode text or files to Base64 (standard or URL-safe) or decode Base64 back to text or a downloadable file.",
    version: "1.1.0",
  };

  execute(
    input: Base64ToolInput,
    _context: ToolContext
  ): ToolResult<Base64ToolOutput> {
    const variant = input.variant ?? "standard";

    if (input.mode === "encode") {
      const bytes = utf8Encode(input.text);
      const result = bytesToBase64(bytes, variant);
      return {
        success: true,
        data: { result, inputBytes: bytes.length, outputBytes: result.length },
        metadata: {},
      };
    }

    const bytes = base64ToBytes(input.text.trim(), variant);
    if (bytes === null) {
      return {
        success: false,
        data: { result: "", inputBytes: 0, outputBytes: 0 },
        metadata: { error: "Invalid Base64 input" },
      };
    }

    try {
      const result = utf8Decode(bytes);
      return {
        success: true,
        data: { result, inputBytes: input.text.trim().length, outputBytes: bytes.length },
        metadata: {},
      };
    } catch (error) {
      return {
        success: false,
        data: { result: "", inputBytes: 0, outputBytes: 0 },
        metadata: {
          error: error instanceof Error ? error.message : "Invalid Base64 input",
        },
      };
    }
  }
}
