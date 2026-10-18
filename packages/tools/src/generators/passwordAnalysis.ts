/**
 * Settings-level analysis for the Password Generator: the character pool (or word list) the chosen
 * options draw from, entropy and keyspace, expected crack times at fixed guess rates, collision odds
 * (birthday bound), equivalent keyspaces and the class make-up of a generated password. Everything
 * except `classifyPassword` depends only on the settings, so it renders identically on server and client.
 */
import { CHARSETS, AMBIGUOUS_CHARS, type PasswordGeneratorInput } from "./PasswordGenerator";
import { PASSPHRASE_WORDS } from "./passphraseWords";

export type CharClass = "uppercase" | "lowercase" | "numbers" | "symbols";
export const CHAR_CLASSES: CharClass[] = ["uppercase", "lowercase", "numbers", "symbols"];

/** Guess rates used by the result card: rate-limited online, well-hashed offline, poorly hashed offline. */
export const GUESS_RATES = [
  { key: "online", perSecond: 100 },
  { key: "offlineSlow", perSecond: 10_000 },
  { key: "offlineFast", perSecond: 100_000_000_000 },
] as const;

export type PasswordSettingsAnalysis = {
  mode: PasswordGeneratorInput["mode"];
  /** Characters available per class after the ambiguity filter (0 when the class is off); empty in passphrase mode. */
  pool: Record<CharClass, number>;
  poolSize: number;
  /** Characters or words drawn. */
  symbols: number;
  /** log2 of the choices per symbol (pool size or word-list size). */
  bitsPerSymbol: number;
  /** Extra bits from the appended two-digit number (passphrase mode). */
  extraBits: number;
  entropyBits: number;
  log10Keyspace: number;
  /** log10 of the expected seconds to find it (half the keyspace) at each guess rate. */
  log10CrackSeconds: Record<(typeof GUESS_RATES)[number]["key"], number>;
  wordListSize: number;
  valid: boolean;
};

export function analyzePasswordSettings(input: PasswordGeneratorInput): PasswordSettingsAnalysis {
  const pool: Record<CharClass, number> = { uppercase: 0, lowercase: 0, numbers: 0, symbols: 0 };
  const flags: Record<CharClass, boolean> = { uppercase: input.includeUppercase, lowercase: input.includeLowercase, numbers: input.includeNumbers, symbols: input.includeSymbols };
  let symbols: number;
  let bitsPerSymbol: number;
  let extraBits = 0;
  let poolSize = 0;

  if (input.mode === "passphrase") {
    symbols = Math.max(3, Math.min(10, input.wordCount));
    bitsPerSymbol = Math.log2(PASSPHRASE_WORDS.length);
    extraBits = input.appendNumber ? Math.log2(100) : 0;
    poolSize = PASSPHRASE_WORDS.length;
  } else {
    for (const c of CHAR_CLASSES) {
      if (!flags[c]) continue;
      pool[c] = [...CHARSETS[c]].filter((ch) => !input.excludeAmbiguous || !AMBIGUOUS_CHARS.has(ch)).length;
    }
    poolSize = CHAR_CLASSES.reduce((s, c) => s + pool[c], 0);
    symbols = input.length;
    bitsPerSymbol = poolSize > 0 ? Math.log2(poolSize) : 0;
  }

  const entropyBits = symbols * bitsPerSymbol + extraBits;
  const log10Keyspace = entropyBits * Math.log10(2);
  const crack = (rate: number) => log10Keyspace - Math.log10(2) - Math.log10(rate);
  return {
    mode: input.mode,
    pool,
    poolSize,
    symbols,
    bitsPerSymbol,
    extraBits,
    entropyBits,
    log10Keyspace,
    log10CrackSeconds: { online: crack(100), offlineSlow: crack(10_000), offlineFast: crack(100_000_000_000) },
    wordListSize: PASSPHRASE_WORDS.length,
    valid: entropyBits > 0,
  };
}

/** Entropy in bits of a character password of the given length drawn from a pool of the given size. */
export function charEntropy(length: number, poolSize: number): number {
  return poolSize > 0 ? length * Math.log2(poolSize) : 0;
}

/** Entropy in bits of a passphrase of n words from this tool's word list (optionally + 2 digits). */
export function passphraseEntropy(words: number, appendNumber = false): number {
  return words * Math.log2(PASSPHRASE_WORDS.length) + (appendNumber ? Math.log2(100) : 0);
}

/**
 * Probability that at least two of n independently generated secrets coincide (birthday bound,
 * 1 − e^(−n(n−1)/2N) with N = 2^bits), computed in log space so huge keyspaces do not underflow.
 */
export function collisionProbability(n: number, entropyBits: number): number {
  const log2x = Math.log2((n * (n - 1)) / 2) - entropyBits;
  if (log2x < -50) return 2 ** log2x; // 1 − e^(−x) ≈ x for tiny x
  return 1 - Math.exp(-(2 ** log2x));
}

/** Counts each character class in a generated password. */
export function classifyPassword(password: string): Record<CharClass | "other", number> {
  const out = { uppercase: 0, lowercase: 0, numbers: 0, symbols: 0, other: 0 };
  for (const ch of password) {
    if (CHARSETS.uppercase.includes(ch)) out.uppercase++;
    else if (CHARSETS.lowercase.includes(ch)) out.lowercase++;
    else if (CHARSETS.numbers.includes(ch)) out.numbers++;
    else if (CHARSETS.symbols.includes(ch)) out.symbols++;
    else out.other++;
  }
  return out;
}
