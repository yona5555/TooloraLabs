import { describe, it, expect } from "vitest";
import { JSONFormatter } from "../JSONFormatter";

const tool = new JSONFormatter();
const ctx = { locale: "en-US" };
const BASE = { json: "", mode: "format" as const, indent: 2 as const, sortKeys: false };

describe("JSONFormatter", () => {
  it("pretty-prints valid JSON with a 2-space indent", () => {
    const output = tool.execute({ ...BASE, json: '{"a":1,"b":2}' }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.result).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it("respects a custom indent size", () => {
    const output = tool.execute({ ...BASE, json: '{"a":1}', indent: 4 }, ctx);
    expect(output.data.result).toBe('{\n    "a": 1\n}');
  });

  it("respects a tab indent", () => {
    const output = tool.execute({ ...BASE, json: '{"a":1}', indent: "tab" }, ctx);
    expect(output.data.result).toBe('{\n\t"a": 1\n}');
  });

  it("minifies JSON", () => {
    const output = tool.execute({ ...BASE, json: '{\n  "a": 1,\n  "b": 2\n}', mode: "minify" }, ctx);
    expect(output.data.result).toBe('{"a":1,"b":2}');
  });

  it("sorts object keys recursively when requested", () => {
    const output = tool.execute({ ...BASE, json: '{"b": 1, "a": {"z": 1, "y": 2}}', sortKeys: true }, ctx);
    expect(output.data.result).toBe('{\n  "a": {\n    "y": 2,\n    "z": 1\n  },\n  "b": 1\n}');
  });

  it("returns a failure result with a precise line/column for invalid JSON instead of throwing", () => {
    const output = tool.execute({ ...BASE, json: '{\n  "a": 1,\n  "b":\n}' }, ctx);
    expect(output.success).toBe(false);
    expect(output.data.result).toBe("");
    expect(output.data.errorLine).toBe(4);
    expect(typeof output.data.errorMessage).toBe("string");
    expect(output.data.errorMessage.length).toBeGreaterThan(0);
  });

  it("computes key count, depth, and byte size stats for valid JSON", () => {
    const output = tool.execute({ ...BASE, json: '{"a": 1, "b": {"c": 2}}' }, ctx);
    expect(output.data.stats).not.toBeNull();
    expect(output.data.stats!.keys).toBe(3);
    expect(output.data.stats!.depth).toBe(3);
    expect(output.data.stats!.sizeBytes).toBeGreaterThan(0);
  });
});
