import { describe, it, expect } from "vitest";
import { PasswordGenerator, estimateCrackTimeSeconds } from "../PasswordGenerator";
import { PASSPHRASE_WORDS } from "../passphraseWords";
import type { PasswordGeneratorInput } from "../PasswordGenerator";

const tool = new PasswordGenerator();
const ctx = { locale: "en-US" };

const BASE: PasswordGeneratorInput = {
  mode: "characters",
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeAmbiguous: false,
  wordCount: 4,
  separator: "-",
  capitalizeWords: false,
  appendNumber: false,
};

describe("PasswordGenerator — character mode", () => {
  it("generates a password of the requested length", () => {
    const output = tool.execute({ ...BASE, includeSymbols: true }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.password).toHaveLength(16);
  });

  it("only uses characters from the selected sets", () => {
    const output = tool.execute({ ...BASE, includeUppercase: false, length: 20 }, ctx);
    expect(output.data.password).toMatch(/^[a-z0-9]+$/);
  });

  it("guarantees at least one character from every selected set when length allows it", () => {
    const output = tool.execute({ ...BASE, length: 12, includeSymbols: true }, ctx);
    const { password } = output.data;
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
  });

  it("returns a failure result when no character set is selected", () => {
    const output = tool.execute(
      { ...BASE, includeUppercase: false, includeLowercase: false, includeNumbers: false, includeSymbols: false },
      ctx
    );
    expect(output.success).toBe(false);
    expect(output.data.password).toBe("");
  });

  it("excludes visually ambiguous characters when requested", () => {
    const output = tool.execute({ ...BASE, length: 200, excludeAmbiguous: true, includeSymbols: true }, ctx);
    expect(output.data.password).not.toMatch(/[0O1lI|]/);
  });

  it("computes entropy as length * log2(pool size)", () => {
    const output = tool.execute({ ...BASE, length: 10, includeUppercase: false, includeNumbers: false }, ctx);
    // lowercase-only pool of 26
    expect(output.data.entropyBits).toBeCloseTo(10 * Math.log2(26), 5);
  });
});

describe("PasswordGenerator — passphrase mode", () => {
  it("generates the requested number of words joined by the separator", () => {
    const output = tool.execute({ ...BASE, mode: "passphrase", wordCount: 5, separator: "-" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.password.split("-")).toHaveLength(5);
  });

  it("only uses words from the passphrase word list", () => {
    const output = tool.execute({ ...BASE, mode: "passphrase", wordCount: 4, separator: " " }, ctx);
    for (const word of output.data.password.split(" ")) {
      expect(PASSPHRASE_WORDS).toContain(word);
    }
  });

  it("capitalizes each word when requested", () => {
    const output = tool.execute({ ...BASE, mode: "passphrase", wordCount: 3, separator: "-", capitalizeWords: true }, ctx);
    for (const word of output.data.password.split("-")) {
      expect(word[0]).toBe(word[0].toUpperCase());
    }
  });

  it("appends a two-digit number when requested", () => {
    const output = tool.execute({ ...BASE, mode: "passphrase", wordCount: 3, separator: "-", appendNumber: true }, ctx);
    const parts = output.data.password.split("-");
    expect(parts).toHaveLength(4);
    expect(parts[3]).toMatch(/^\d{2}$/);
  });

  it("clamps word count into the supported 3-10 range", () => {
    const tooFew = tool.execute({ ...BASE, mode: "passphrase", wordCount: 1, separator: "-" }, ctx);
    expect(tooFew.data.password.split("-")).toHaveLength(3);

    const tooMany = tool.execute({ ...BASE, mode: "passphrase", wordCount: 50, separator: "-" }, ctx);
    expect(tooMany.data.password.split("-")).toHaveLength(10);
  });

  it("computes entropy as wordCount * log2(wordlist size)", () => {
    const output = tool.execute({ ...BASE, mode: "passphrase", wordCount: 4, separator: "-" }, ctx);
    expect(output.data.entropyBits).toBeCloseTo(4 * Math.log2(PASSPHRASE_WORDS.length), 5);
  });
});

describe("estimateCrackTimeSeconds", () => {
  it("halves as the guess rate doubles", () => {
    const slow = estimateCrackTimeSeconds(40, 100);
    const fast = estimateCrackTimeSeconds(40, 200);
    expect(fast).toBeCloseTo(slow / 2, 5);
  });

  it("scales exponentially with entropy bits", () => {
    const base = estimateCrackTimeSeconds(10, 1);
    const plusTen = estimateCrackTimeSeconds(20, 1);
    expect(plusTen / base).toBeCloseTo(1024, 5);
  });

  it("returns half the keyspace size in seconds at 1 guess/second", () => {
    expect(estimateCrackTimeSeconds(10, 1)).toBeCloseTo(512, 5);
  });
});
