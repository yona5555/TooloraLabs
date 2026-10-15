import { describe, it, expect } from "vitest";
import { autoFixJSON } from "../jsonAutoFix";
import { findJSONSyntaxError } from "../jsonValidate";

function isValid(text: string): boolean {
  return findJSONSyntaxError(text) === null;
}

describe("autoFixJSON", () => {
  it("removes a trailing comma in an object", () => {
    const { fixed, changed, kinds } = autoFixJSON('{"a": 1, "b": 2,}');
    expect(changed).toBe(true);
    expect(kinds).toContain("trailingComma");
    expect(isValid(fixed)).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ a: 1, b: 2 });
  });

  it("removes a trailing comma in an array", () => {
    const { fixed, kinds } = autoFixJSON("[1, 2, 3,]");
    expect(kinds).toContain("trailingComma");
    expect(isValid(fixed)).toBe(true);
    expect(JSON.parse(fixed)).toEqual([1, 2, 3]);
  });

  it("converts single-quoted keys and values to double quotes", () => {
    const { fixed, kinds } = autoFixJSON("{'a': 'hello'}");
    expect(kinds).toContain("singleQuotes");
    expect(isValid(fixed)).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ a: "hello" });
  });

  it("quotes a bare object key", () => {
    const { fixed, kinds } = autoFixJSON('{foo: 1, "bar": 2}');
    expect(kinds).toContain("unquotedKeys");
    expect(isValid(fixed)).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ foo: 1, bar: 2 });
  });

  it("strips a line comment", () => {
    const { fixed, kinds } = autoFixJSON('{\n  "a": 1 // note\n}');
    expect(kinds).toContain("comments");
    expect(isValid(fixed)).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ a: 1 });
  });

  it("strips a block comment", () => {
    const { fixed, kinds } = autoFixJSON('{ /* note */ "a": 1 }');
    expect(kinds).toContain("comments");
    expect(isValid(fixed)).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ a: 1 });
  });

  it("handles several mistakes at once", () => {
    const { fixed, kinds } = autoFixJSON("{foo: 'bar', baz: [1, 2,], // trailing\n}");
    expect(kinds).toEqual(expect.arrayContaining(["unquotedKeys", "singleQuotes", "trailingComma", "comments"]));
    expect(isValid(fixed)).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ foo: "bar", baz: [1, 2] });
  });

  it("does not touch a double slash inside a real string value", () => {
    const { fixed, changed } = autoFixJSON('{"url": "https://example.com"}');
    expect(changed).toBe(false);
    expect(fixed).toBe('{"url": "https://example.com"}');
  });

  it("reports changed:false for already-valid JSON", () => {
    const { changed, fixed } = autoFixJSON('{"a": 1}');
    expect(changed).toBe(false);
    expect(fixed).toBe('{"a": 1}');
  });

  it("leaves genuinely unfixable JSON invalid (missing value)", () => {
    const { fixed } = autoFixJSON('{"a": }');
    expect(isValid(fixed)).toBe(false);
  });
});
