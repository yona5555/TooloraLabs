import { describe, expect, it } from "vitest";
import { analyzeBarcode, code128Modules, gs1Issuer } from "../barcodeAnalysis";
import { BarcodeGenerator } from "../BarcodeGenerator";

const gen = new BarcodeGenerator();
const modulesOf = (symbology: "upc-a" | "ean-13" | "code128", value: string) => gen.execute({ symbology, value }, { locale: "en-US" }).data.segments.reduce((s, x) => s + x.width, 0);

describe("analyzeBarcode", () => {
  it("EAN-13 5901234123457 (GS1 Poland example)", () => {
    const a = analyzeBarcode("ean-13", "590123412345")!;
    expect(a.fullText).toBe("5901234123457");
    expect(a.check).toMatchObject({ sum: 83, remainder: 3, check: 7 });
    expect(a.parityPattern).toBe("LGGLLG");
    expect(a.gs1).toEqual({ prefix: "590", issuer: "poland" });
    expect(a.modules).toBe(95);
    expect(a.modules).toBe(modulesOf("ean-13", "590123412345"));
    expect(a.sizes[1].widthMm).toBeCloseTo(37.29, 2);
    expect(a.errors.substitutions).toEqual({ total: 108, detected: 108 });
  });

  it("UPC-A 036000291452 matches the generator and the US/Canada prefix", () => {
    const a = analyzeBarcode("upc-a", "03600029145")!;
    expect(a.fullText).toBe("036000291452");
    expect(a.modules).toBe(modulesOf("upc-a", "03600029145"));
    expect(a.gs1?.issuer).toBe("usCanada");
    expect(a.bars).toBe(30);
    expect(a.darkModules + (a.modules - a.darkModules)).toBe(95);
  });

  it("Code 128 checksum, modules and perfect error detection", () => {
    const a = analyzeBarcode("code128", "Wikipedia")!;
    expect(a.check.check).toBe(a.check.sum % 103);
    expect(a.modules).toBe(code128Modules(9));
    expect(a.modules).toBe(modulesOf("code128", "Wikipedia"));
    expect(a.errors.substitutions.detected).toBe(a.errors.substitutions.total);
    expect(a.errors.transpositions.detected).toBe(a.errors.transpositions.total);
  });

  it("rejects invalid input and maps prefixes", () => {
    expect(analyzeBarcode("ean-13", "12")).toBeNull();
    expect(gs1Issuer("9780306406157")).toBe("bookland");
    expect(gs1Issuer("4006381333931")).toBe("germany");
  });
});
