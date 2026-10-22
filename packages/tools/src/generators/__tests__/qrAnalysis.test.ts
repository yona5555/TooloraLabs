import { describe, expect, it } from "vitest";
import QRCode from "qrcode";
import { analyzeQR } from "../qrAnalysis";

describe("analyzeQR", () => {
  it("classifies exactly the library's reserved modules as non-data (versions 2, 7, 14)", () => {
    for (const text of ["https://tooloralabs.com", "x".repeat(120), "y".repeat(300)]) {
      const a = analyzeQR(text, "M");
      const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
      const reserved = Array.from(qr.modules.reservedBit as unknown as ArrayLike<number>);
      a.regions.forEach((r, i) => expect(r === "data").toBe(reserved[i] === 0));
      expect(a.size).toBe(17 + 4 * a.version);
    }
  });

  it("reports the codeword budget and capacity", () => {
    const a = analyzeQR("https://tooloralabs.com", "M");
    expect(a.version).toBe(2);
    // Version 2: 44 codewords, 16 for EC at level M (ISO/IEC 18004 table 9).
    expect(a.totalCodewords).toBe(44);
    expect(a.ecCodewords).toBe(16);
    expect(a.capacityAtVersion.M).toBe(26);
    expect(a.capacityAtVersion.L).toBe(32);
    expect(a.usedBits).toBeLessThanOrEqual(a.dataCodewords * 8);
    expect(a.usedBits).toBe(4 + 8 + 23 * 8);
    expect(a.minVersion.H).toBeGreaterThanOrEqual(a.minVersion.L!);
    expect(a.capacityByVersion[39]).toBe(2331);
  });

  it("counts payload bytes", () => {
    const a = analyzeQR("Café 2026!", "L");
    expect(a.payloadBytes).toBe(11);
    expect(a.byteKinds).toEqual({ letters: 3, digits: 4, spaces: 1, punctuation: 1, multibyte: 2 });
  });
});
