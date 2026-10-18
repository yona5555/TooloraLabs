import { describe, expect, it } from "vitest";
import { analyzePasswordSettings, charEntropy, classifyPassword, collisionProbability, passphraseEntropy } from "../passwordAnalysis";
import { PasswordGenerator, type PasswordGeneratorInput } from "../PasswordGenerator";

const base: PasswordGeneratorInput = { mode: "characters", length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: false, excludeAmbiguous: false, wordCount: 4, separator: "-", capitalizeWords: true, appendNumber: false };

describe("analyzePasswordSettings", () => {
  it("matches the generator's own entropy and pool", () => {
    const out = new PasswordGenerator().execute(base, { locale: "en-US" }).data;
    const a = analyzePasswordSettings(base);
    expect(a.poolSize).toBe(62);
    expect(a.poolSize).toBe(out.poolSize);
    expect(a.entropyBits).toBeCloseTo(out.entropyBits, 10);
    expect(a.log10CrackSeconds.offlineFast).toBeCloseTo(16 * Math.log10(62) - Math.log10(2) - 11, 10);
  });

  it("applies the ambiguity filter per class", () => {
    const a = analyzePasswordSettings({ ...base, includeSymbols: true, excludeAmbiguous: true });
    expect(a.pool).toEqual({ uppercase: 24, lowercase: 25, numbers: 8, symbols: 25 });
  });

  it("handles passphrases", () => {
    const p = { ...base, mode: "passphrase" as const, appendNumber: true };
    const out = new PasswordGenerator().execute(p, { locale: "en-US" }).data;
    expect(analyzePasswordSettings(p).entropyBits).toBeCloseTo(out.entropyBits, 10);
    expect(passphraseEntropy(4, true)).toBeCloseTo(out.entropyBits, 10);
  });
});

describe("helpers", () => {
  it("birthday bound and classification", () => {
    expect(collisionProbability(2, 1)).toBeCloseTo(1 - Math.exp(-0.5), 12);
    expect(collisionProbability(1e9, 128)).toBeGreaterThan(0);
    expect(collisionProbability(1e9, 128)).toBeLessThan(1e-20);
    expect(charEntropy(8, 26)).toBeCloseTo(37.6, 1);
    expect(classifyPassword("aB3$é")).toEqual({ uppercase: 1, lowercase: 1, numbers: 1, symbols: 1, other: 1 });
  });
});
