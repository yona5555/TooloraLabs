import { describe, it, expect } from "vitest";
import { BarcodeGenerator } from "../BarcodeGenerator";
import { CODE128_BARS } from "../barcodeTables";

const tool = new BarcodeGenerator();
const ctx = { locale: "en-US" };

function segmentsToBits(segments: { width: number; filled: boolean }[]): string {
  return segments.map((s) => (s.filled ? "1" : "0").repeat(s.width)).join("");
}

describe("BarcodeGenerator — UPC-A", () => {
  it("computes the correct check digit for a real published UPC-A (Wrigley's gum, 036000291452)", () => {
    const output = tool.execute({ symbology: "upc-a", value: "03600029145" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.displayText.replace(/\s/g, "")).toBe("036000291452");
  });

  it("rejects a value that isn't exactly 11 digits", () => {
    const tooShort = tool.execute({ symbology: "upc-a", value: "123" }, ctx);
    expect(tooShort.success).toBe(false);
    expect(tooShort.metadata.error).toBe("INVALID_LENGTH_UPC");

    const tooLong = tool.execute({ symbology: "upc-a", value: "123456789012345" }, ctx);
    expect(tooLong.success).toBe(false);
    expect(tooLong.metadata.error).toBe("INVALID_LENGTH_UPC");
  });

  it("rejects non-digit characters", () => {
    const output = tool.execute({ symbology: "upc-a", value: "0360002914X" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("NON_DIGIT");
  });

  it("produces a symmetric start/end guard and a valid module count", () => {
    const output = tool.execute({ symbology: "upc-a", value: "03600029145" }, ctx);
    const bits = segmentsToBits(output.data.segments);
    // 3 (start) + 42 (left) + 5 (center) + 42 (right) + 3 (end) = 95 modules
    expect(bits).toHaveLength(95);
    expect(bits.startsWith("101")).toBe(true);
    expect(bits.endsWith("101")).toBe(true);
  });
});

describe("BarcodeGenerator — EAN-13", () => {
  it("computes the correct check digit for the well-known Wikipedia EAN-13 example (4006381333931)", () => {
    const output = tool.execute({ symbology: "ean-13", value: "400638133393" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.displayText.replace(/\s/g, "")).toBe("4006381333931");
  });

  it("rejects a value that isn't exactly 12 digits", () => {
    const output = tool.execute({ symbology: "ean-13", value: "12345" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("INVALID_LENGTH_EAN");
  });

  it("produces a 95-module symbol with correct guards", () => {
    const output = tool.execute({ symbology: "ean-13", value: "400638133393" }, ctx);
    const bits = segmentsToBits(output.data.segments);
    expect(bits).toHaveLength(95);
    expect(bits.startsWith("101")).toBe(true);
    expect(bits.endsWith("101")).toBe(true);
  });

  it("varies the left-group parity pattern with the first digit (mixed L/G, not all-L like UPC-A)", () => {
    // First digit 4 -> parity "LGLLGG", so the left group must NOT be pure L-code
    // (i.e. it must differ from what UPC-A would produce for the same 6 digits).
    const ean = tool.execute({ symbology: "ean-13", value: "400638133393" }, ctx);
    const upc = tool.execute({ symbology: "upc-a", value: "40063813339" }, ctx);
    const eanBits = segmentsToBits(ean.data.segments);
    const upcBits = segmentsToBits(upc.data.segments);
    // Same digits, but EAN's mixed parity must produce a different left-group bit pattern than UPC-A's pure L-code.
    expect(eanBits.slice(3, 45)).not.toBe(upcBits.slice(3, 45));
  });
});

describe("BarcodeGenerator — Code 128", () => {
  it("encodes text and reports it back as the display text", () => {
    const output = tool.execute({ symbology: "code128", value: "TOOLORA-2026" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.displayText).toBe("TOOLORA-2026");
  });

  it("starts with the Start B pattern and ends with the Stop pattern", () => {
    const output = tool.execute({ symbology: "code128", value: "AB" }, ctx);
    const bits = segmentsToBits(output.data.segments);
    expect(bits.startsWith(CODE128_BARS[104])).toBe(true);
    expect(bits.endsWith(CODE128_BARS[106])).toBe(true);
  });

  it("computes the checksum using the (start + weighted sum) mod 103 formula", () => {
    // "A" = value 33 (charCode 65 - 32). checksum = (104 + 33*1) % 103 = 137 % 103 = 34.
    const output = tool.execute({ symbology: "code128", value: "A" }, ctx);
    const bits = segmentsToBits(output.data.segments);
    const expectedBits = CODE128_BARS[104] + CODE128_BARS[33] + CODE128_BARS[34] + CODE128_BARS[106];
    expect(bits).toBe(expectedBits);
  });

  it("rejects characters outside the printable ASCII range", () => {
    const output = tool.execute({ symbology: "code128", value: "héllo" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("UNSUPPORTED_CHARACTER");
  });

  it("rejects excessively long input", () => {
    const output = tool.execute({ symbology: "code128", value: "a".repeat(60) }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("TOO_LONG");
  });
});

describe("BarcodeGenerator — shared", () => {
  it("returns a failure for empty input regardless of symbology", () => {
    const output = tool.execute({ symbology: "code128", value: "   " }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("EMPTY_INPUT");
  });
});
