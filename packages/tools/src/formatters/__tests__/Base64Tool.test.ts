import { describe, it, expect } from "vitest";
import { Base64Tool } from "../Base64Tool";

const tool = new Base64Tool();
const ctx = { locale: "en-US" };

describe("Base64Tool", () => {
  it("encodes plain ASCII text", () => {
    const output = tool.execute({ text: "Hello, World!", mode: "encode" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.result).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("decodes back to the original ASCII text", () => {
    const output = tool.execute(
      { text: "SGVsbG8sIFdvcmxkIQ==", mode: "decode" },
      ctx
    );
    expect(output.data.result).toBe("Hello, World!");
  });

  it("round-trips Unicode text (Arabic)", () => {
    const original = "مرحبًا بالعالم";
    const encoded = tool.execute({ text: original, mode: "encode" }, ctx);
    const decoded = tool.execute(
      { text: encoded.data.result, mode: "decode" },
      ctx
    );
    expect(decoded.data.result).toBe(original);
  });

  it("round-trips emoji (surrogate pairs)", () => {
    const original = "hello 🎉🚀";
    const encoded = tool.execute({ text: original, mode: "encode" }, ctx);
    const decoded = tool.execute(
      { text: encoded.data.result, mode: "decode" },
      ctx
    );
    expect(decoded.data.result).toBe(original);
  });

  it("returns a failure result for invalid Base64 on decode", () => {
    const output = tool.execute({ text: "not valid base64!!", mode: "decode" }, ctx);
    expect(output.success).toBe(false);
    expect(output.data.result).toBe("");
  });

  it("reports input/output byte counts on encode", () => {
    const output = tool.execute({ text: "Hello, World!", mode: "encode" }, ctx);
    expect(output.data.inputBytes).toBe(13);
    expect(output.data.outputBytes).toBe(20);
  });

  it("encodes using the URL-safe alphabet without padding", () => {
    const output = tool.execute(
      { text: "subjects?_d=1", mode: "encode", variant: "urlSafe" },
      ctx
    );
    expect(output.data.result).not.toMatch(/[+/=]/);
  });

  it("round-trips through the URL-safe variant", () => {
    const original = "hello 🎉 world?";
    const encoded = tool.execute(
      { text: original, mode: "encode", variant: "urlSafe" },
      ctx
    );
    const decoded = tool.execute(
      { text: encoded.data.result, mode: "decode", variant: "urlSafe" },
      ctx
    );
    expect(decoded.data.result).toBe(original);
  });

  it("rejects standard-alphabet characters ('+') when decoding as URL-safe", () => {
    const output = tool.execute(
      { text: "a+b", mode: "decode", variant: "urlSafe" },
      ctx
    );
    expect(output.success).toBe(false);
  });
});
