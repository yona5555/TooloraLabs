import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";
import { PASSPHRASE_WORDS } from "./passphraseWords";

export type PasswordMode = "characters" | "passphrase";
export type PassphraseSeparator = "-" | "_" | " " | "";

export type PasswordGeneratorInput = {
  mode: PasswordMode;
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  wordCount: number;
  separator: PassphraseSeparator;
  capitalizeWords: boolean;
  appendNumber: boolean;
};

export type PasswordGeneratorOutput = {
  password: string;
  entropyBits: number;
  poolSize: number;
};

const CHARSETS: Record<"uppercase" | "lowercase" | "numbers" | "symbols", string> = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

/** Characters that are easy to misread in some fonts: 0/O, 1/l/I, etc. */
const AMBIGUOUS = new Set(["0", "O", "1", "l", "I", "|"]);

function removeAmbiguous(pool: string): string {
  return Array.from(pool)
    .filter((ch) => !AMBIGUOUS.has(ch))
    .join("");
}

/**
 * Uniform, unbiased random index in [0, max) via Web Crypto rejection
 * sampling — Math.random() is not cryptographically secure and must never
 * back a password generator; a naive `% max` on a secure random value would
 * still introduce modulo bias for pool sizes that don't evenly divide 256.
 */
function secureRandomIndex(max: number): number {
  const bytes = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let value: number;
  do {
    crypto.getRandomValues(bytes);
    value = bytes[0];
  } while (value >= limit);
  return value % max;
}

function pickRandomChar(pool: string): string {
  return pool[secureRandomIndex(pool.length)];
}

function pickRandomWord(): string {
  return PASSPHRASE_WORDS[secureRandomIndex(PASSPHRASE_WORDS.length)];
}

function secureShuffle(chars: string[]): string[] {
  const result = [...chars];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateCharacterPassword(input: PasswordGeneratorInput): ToolResult<PasswordGeneratorOutput> {
  let selectedSets = [
    input.includeUppercase && CHARSETS.uppercase,
    input.includeLowercase && CHARSETS.lowercase,
    input.includeNumbers && CHARSETS.numbers,
    input.includeSymbols && CHARSETS.symbols,
  ].filter((set): set is string => Boolean(set));

  if (input.excludeAmbiguous) {
    selectedSets = selectedSets.map(removeAmbiguous).filter((set) => set.length > 0);
  }

  if (selectedSets.length === 0) {
    return {
      success: false,
      data: { password: "", entropyBits: 0, poolSize: 0 },
      metadata: { error: "No character set selected" },
    };
  }

  const pool = selectedSets.join("");
  const chars: string[] = [];

  if (input.length >= selectedSets.length) {
    for (const set of selectedSets) chars.push(pickRandomChar(set));
  }
  while (chars.length < input.length) chars.push(pickRandomChar(pool));

  const password = secureShuffle(chars).join("");
  const entropyBits = password.length * Math.log2(pool.length);

  return { success: true, data: { password, entropyBits, poolSize: pool.length }, metadata: {} };
}

function generatePassphrase(input: PasswordGeneratorInput): ToolResult<PasswordGeneratorOutput> {
  const count = Math.max(3, Math.min(10, input.wordCount));
  const words = Array.from({ length: count }, () => {
    const word = pickRandomWord();
    return input.capitalizeWords ? word[0].toUpperCase() + word.slice(1) : word;
  });

  let password = words.join(input.separator);
  let entropyBits = count * Math.log2(PASSPHRASE_WORDS.length);

  if (input.appendNumber) {
    const digits = String(secureRandomIndex(100)).padStart(2, "0");
    password += (input.separator || "-") + digits;
    entropyBits += Math.log2(100);
  }

  return { success: true, data: { password, entropyBits, poolSize: PASSPHRASE_WORDS.length }, metadata: {} };
}

/**
 * Expected time (in seconds) for an attacker guessing at a fixed rate to
 * find this password on average — i.e. after searching half the keyspace.
 * This is an illustrative order-of-magnitude estimate, not a guarantee: real
 * security depends entirely on how (and how slowly) the receiving service
 * hashes the password before storing it, which this tool has no way to know.
 */
export function estimateCrackTimeSeconds(entropyBits: number, guessesPerSecond: number): number {
  const combinations = Math.pow(2, entropyBits);
  return combinations / 2 / guessesPerSecond;
}

export class PasswordGenerator extends BaseTool<PasswordGeneratorInput, PasswordGeneratorOutput> {
  metadata = {
    id: "password-generator",
    slug: "password-generator",
    name: "Password Generator",
    category: "developer-tools",
    description: "Generate strong random passwords or memorable passphrases, with an entropy-based strength estimate.",
    version: "2.0.0",
  };

  execute(input: PasswordGeneratorInput, _context: ToolContext): ToolResult<PasswordGeneratorOutput> {
    return input.mode === "passphrase" ? generatePassphrase(input) : generateCharacterPassword(input);
  }
}
