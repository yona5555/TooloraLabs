/**
 * A minimal hand-rolled JSON (ECMA-404) recursive-descent validator whose
 * only job is precise, engine-independent error location. Native
 * `JSON.parse` error messages vary wildly by engine/version (V8 alone
 * changed format between Node releases, and doesn't always include a
 * position at all) — this always finds the exact line/column of the first
 * syntax deviation, deterministically, so we can point straight at it.
 */
export type JSONSyntaxError = {
  message: string;
  line: number;
  column: number;
  position: number;
};

const WHITESPACE = new Set([" ", "\t", "\n", "\r"]);

class Scanner {
  private i = 0;
  private line = 1;
  private column = 1;

  constructor(private readonly text: string) {}

  private advance(): string {
    const char = this.text[this.i];
    this.i++;
    if (char === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private peek(): string | undefined {
    return this.text[this.i];
  }

  private fail(message: string): never {
    throw { message, line: this.line, column: this.column, position: this.i } satisfies JSONSyntaxError;
  }

  private skipWhitespace() {
    while (this.i < this.text.length && WHITESPACE.has(this.text[this.i])) {
      this.advance();
    }
  }

  parse(): void {
    this.skipWhitespace();
    this.parseValue();
    this.skipWhitespace();
    if (this.i < this.text.length) {
      this.fail(`Unexpected trailing content after the JSON value`);
    }
  }

  private parseValue(): void {
    const char = this.peek();
    if (char === undefined) this.fail("Unexpected end of input, expected a value");
    if (char === "{") return this.parseObject();
    if (char === "[") return this.parseArray();
    if (char === '"') return void this.parseString();
    if (char === "-" || (char >= "0" && char <= "9")) return this.parseNumber();
    if (this.text.startsWith("true", this.i)) return this.advanceLiteral(4);
    if (this.text.startsWith("false", this.i)) return this.advanceLiteral(5);
    if (this.text.startsWith("null", this.i)) return this.advanceLiteral(4);
    if (char === "'") this.fail("Strings must use double quotes (\"), not single quotes (')");
    this.fail(`Unexpected character "${char}"`);
  }

  private advanceLiteral(length: number) {
    for (let n = 0; n < length; n++) this.advance();
  }

  private parseObject(): void {
    this.advance(); // {
    this.skipWhitespace();
    if (this.peek() === "}") {
      this.advance();
      return;
    }
    for (;;) {
      this.skipWhitespace();
      if (this.peek() === "}") {
        this.fail("Trailing comma is not allowed before '}'");
      }
      if (this.peek() !== '"') {
        if (this.peek() === "'") this.fail("Object keys must use double quotes (\"), not single quotes (')");
        this.fail("Expected a double-quoted key");
      }
      this.parseString();
      this.skipWhitespace();
      if (this.peek() !== ":") this.fail("Expected ':' after object key");
      this.advance();
      this.skipWhitespace();
      this.parseValue();
      this.skipWhitespace();
      const next = this.peek();
      if (next === ",") {
        this.advance();
        continue;
      }
      if (next === "}") {
        this.advance();
        return;
      }
      this.fail("Expected ',' or '}' in object");
    }
  }

  private parseArray(): void {
    this.advance(); // [
    this.skipWhitespace();
    if (this.peek() === "]") {
      this.advance();
      return;
    }
    for (;;) {
      this.skipWhitespace();
      if (this.peek() === "]") {
        this.fail("Trailing comma is not allowed before ']'");
      }
      this.parseValue();
      this.skipWhitespace();
      const next = this.peek();
      if (next === ",") {
        this.advance();
        continue;
      }
      if (next === "]") {
        this.advance();
        return;
      }
      this.fail("Expected ',' or ']' in array");
    }
  }

  private parseString(): string {
    this.advance(); // opening quote
    let out = "";
    for (;;) {
      const char = this.peek();
      if (char === undefined) this.fail("Unterminated string");
      if (char === '"') {
        this.advance();
        return out;
      }
      if (char === "\\") {
        this.advance();
        const escaped = this.peek();
        if (escaped === undefined) this.fail("Unterminated string escape");
        if (!"\"\\/bfnrtu".includes(escaped)) this.fail(`Invalid escape sequence "\\${escaped}"`);
        this.advance();
        if (escaped === "u") {
          for (let n = 0; n < 4; n++) {
            const hex = this.peek();
            if (hex === undefined || !/[0-9a-fA-F]/.test(hex)) this.fail("Invalid unicode escape (expected 4 hex digits)");
            this.advance();
          }
        }
        out += escaped;
        continue;
      }
      if (char.charCodeAt(0) < 0x20) this.fail("Control characters must be escaped inside a string");
      out += char;
      this.advance();
    }
  }

  private parseNumber(): void {
    if (this.peek() === "-") this.advance();
    if (this.peek() === "0") {
      this.advance();
    } else if (this.peek() !== undefined && this.peek()! >= "1" && this.peek()! <= "9") {
      while (this.peek() !== undefined && this.peek()! >= "0" && this.peek()! <= "9") this.advance();
    } else {
      this.fail("Invalid number");
    }
    if (this.peek() === ".") {
      this.advance();
      if (this.peek() === undefined || !/[0-9]/.test(this.peek()!)) this.fail("Expected digits after decimal point");
      while (this.peek() !== undefined && /[0-9]/.test(this.peek()!)) this.advance();
    }
    if (this.peek() === "e" || this.peek() === "E") {
      this.advance();
      if (this.peek() === "+" || this.peek() === "-") this.advance();
      if (this.peek() === undefined || !/[0-9]/.test(this.peek()!)) this.fail("Expected digits in exponent");
      while (this.peek() !== undefined && /[0-9]/.test(this.peek()!)) this.advance();
    }
  }
}

/** Returns null if `text` is valid JSON, or the precise location of the first syntax error. */
export function findJSONSyntaxError(text: string): JSONSyntaxError | null {
  try {
    new Scanner(text).parse();
    return null;
  } catch (error) {
    if (error && typeof error === "object" && "line" in error) return error as JSONSyntaxError;
    return { message: "Invalid JSON", line: 1, column: 1, position: 0 };
  }
}
