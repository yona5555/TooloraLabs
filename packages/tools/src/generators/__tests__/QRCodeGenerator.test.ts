import { describe, it, expect } from "vitest";
import { QRCodeGenerator } from "../QRCodeGenerator";

const tool = new QRCodeGenerator();
const ctx = { locale: "en-US" };

describe("QRCodeGenerator", () => {
  it("generates an SVG QR code for valid text", async () => {
    const output = await tool.execute({ text: "https://tooloralabs.com" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.svg).toContain("<svg");
    expect(output.data.svg).toContain("</svg>");
  });

  it("returns a failure result for empty text", async () => {
    const output = await tool.execute({ text: "   " }, ctx);
    expect(output.success).toBe(false);
    expect(output.data.svg).toBe("");
  });

  it("returns a failure result for text that is too long", async () => {
    const output = await tool.execute({ text: "a".repeat(2001) }, ctx);
    expect(output.success).toBe(false);
  });
});
