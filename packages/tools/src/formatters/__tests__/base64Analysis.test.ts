import { describe, expect, it } from "vitest";
import { analyzeBase64, percentEncodedLength } from "../base64Analysis";
import { bytesToBase64, utf8Encode } from "../Base64Tool";

describe("analyzeBase64", () => {
  it("splits RFC 4648 test vectors into groups", () => {
    const bytes = utf8Encode("foobar");
    const a = analyzeBase64(bytes, bytesToBase64(bytes), "standard");
    expect(a.standard).toBe("Zm9vYmFy");
    expect(a.groups.map((g) => g.chars.join(""))).toEqual(["Zm9v", "YmFy"]);
    expect(a.groups[0].sextets).toEqual([25, 38, 61, 47]);
    const f = utf8Encode("fo");
    const b = analyzeBase64(f, bytesToBase64(f), "standard");
    expect(b.groups[0].chars.join("")).toBe("Zm8=");
    expect(b.padding).toBe(1);
  });

  it("computes sizes in other encodings", () => {
    const bytes = utf8Encode("Hello, مرحبا");
    const a = analyzeBase64(bytes, bytesToBase64(bytes), "standard");
    expect(a.byteCount).toBe(17);
    expect(a.encodings).toEqual({ hex: 34, base32: 32, base64: 24, ascii85: 22, percent: 5 + 3 + 3 + 30 });
    expect(a.byteClasses).toEqual({ ascii: 7, control: 0, lead: 5, continuation: 5, invalid: 0 });
    expect(percentEncodedLength(utf8Encode("a b"))).toBe(5);
  });

  it("MIME wrapping and entropy bounds", () => {
    const bytes = Array.from({ length: 120 }, (_, i) => i);
    const a = analyzeBase64(bytes, bytesToBase64(bytes), "standard");
    expect(a.paddedLength).toBe(160);
    expect(a.mimeLines).toBe(3);
    expect(a.mimeLength).toBe(164);
    expect(a.entropy).toBeGreaterThan(5);
    expect(a.entropy).toBeLessThanOrEqual(6);
  });
});
