import { describe, it, expect } from "vitest";
import { findJSONSyntaxError } from "../jsonValidate";

describe("findJSONSyntaxError", () => {
  it("returns null for valid JSON", () => {
    expect(findJSONSyntaxError('{"a": 1, "b": [1, 2, 3], "c": {"d": null, "e": true, "f": false}}')).toBeNull();
  });

  it("returns null for a bare number, string, or literal", () => {
    expect(findJSONSyntaxError("42")).toBeNull();
    expect(findJSONSyntaxError('"hello"')).toBeNull();
    expect(findJSONSyntaxError("null")).toBeNull();
    expect(findJSONSyntaxError("-3.14e10")).toBeNull();
  });

  it("returns null for nested structures across multiple lines", () => {
    expect(
      findJSONSyntaxError(`{
  "a": 1,
  "b": [1, 2, 3]
}`)
    ).toBeNull();
  });

  it("locates a trailing comma in an object", () => {
    const err = findJSONSyntaxError('{"a": 1, "b": 2,}');
    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/trailing comma/i);
  });

  it("locates a trailing comma in an array", () => {
    const err = findJSONSyntaxError("[1, 2, 3,]");
    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/trailing comma/i);
  });

  it("reports the correct line and column for a multi-line error", () => {
    const err = findJSONSyntaxError('{\n  "a": 1,\n  "b": ,\n}');
    expect(err).not.toBeNull();
    expect(err!.line).toBe(3);
  });

  it("flags single-quoted strings", () => {
    const err = findJSONSyntaxError("{'a': 1}");
    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/double quotes/i);
  });

  it("flags unquoted object keys", () => {
    const err = findJSONSyntaxError("{a: 1}");
    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/double-quoted key/i);
  });

  it("flags an unterminated string", () => {
    const err = findJSONSyntaxError('{"a": "unterminated}');
    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/unterminated string/i);
  });

  it("flags an invalid escape sequence", () => {
    const err = findJSONSyntaxError('{"a": "bad \\x escape"}');
    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/invalid escape/i);
  });

  it("flags trailing content after a valid value", () => {
    const err = findJSONSyntaxError("{}{}");
    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/trailing content/i);
  });

  it("flags an empty input", () => {
    const err = findJSONSyntaxError("");
    expect(err).not.toBeNull();
  });

  it("flags a leading zero in a number", () => {
    const err = findJSONSyntaxError('{"a": 007}');
    expect(err).not.toBeNull();
  });
});
