import { describe, it, expect } from "vitest";
import { JSONFormatter } from "../JSONFormatter";

const tool = new JSONFormatter();
const ctx = { locale: "en-US" };

describe("JSONFormatter", () => {
  it("pretty-prints valid JSON with default indent", () => {
    const output = tool.execute({ json: '{"a":1,"b":2}', mode: "format" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.result).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it("respects a custom indent size", () => {
    const output = tool.execute(
      { json: '{"a":1}', mode: "format", indent: 4 },
      ctx
    );
    expect(output.data.result).toBe('{\n    "a": 1\n}');
  });

  it("minifies JSON", () => {
    const output = tool.execute(
      { json: '{\n  "a": 1,\n  "b": 2\n}', mode: "minify" },
      ctx
    );
    expect(output.data.result).toBe('{"a":1,"b":2}');
  });

  it("returns a failure result for invalid JSON instead of throwing", () => {
    const output = tool.execute({ json: "{not valid", mode: "format" }, ctx);
    expect(output.success).toBe(false);
    expect(output.data.result).toBe("");
    expect(typeof output.metadata.error).toBe("string");
  });
});
