import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type PasswordGeneratorInput = {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
};

export type PasswordGeneratorOutput = {
  password: string;
};

const CHARSETS: Record<"uppercase" | "lowercase" | "numbers" | "symbols", string> = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function pickRandomChar(pool: string): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffle(chars: string[]): string[] {
  const result = [...chars];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class PasswordGenerator extends BaseTool<
  PasswordGeneratorInput,
  PasswordGeneratorOutput
> {
  metadata = {
    id: "password-generator",
    slug: "password-generator",
    name: "Password Generator",
    category: "developer-tools",
    description: "Generate strong and secure passwords.",
    version: "1.0.0",
  };

  execute(
    input: PasswordGeneratorInput,
    _context: ToolContext
  ): ToolResult<PasswordGeneratorOutput> {
    const selectedSets = [
      input.includeUppercase && CHARSETS.uppercase,
      input.includeLowercase && CHARSETS.lowercase,
      input.includeNumbers && CHARSETS.numbers,
      input.includeSymbols && CHARSETS.symbols,
    ].filter((set): set is string => Boolean(set));

    if (selectedSets.length === 0) {
      return {
        success: false,
        data: { password: "" },
        metadata: { error: "No character set selected" },
      };
    }

    const pool = selectedSets.join("");
    const chars: string[] = [];

    if (input.length >= selectedSets.length) {
      for (const set of selectedSets) {
        chars.push(pickRandomChar(set));
      }
    }
    while (chars.length < input.length) {
      chars.push(pickRandomChar(pool));
    }

    return {
      success: true,
      data: { password: shuffle(chars).join("") },
      metadata: {},
    };
  }
}
