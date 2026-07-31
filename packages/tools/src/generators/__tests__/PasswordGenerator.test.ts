import { describe, it, expect } from "vitest";
import { PasswordGenerator } from "../PasswordGenerator";

const tool = new PasswordGenerator();
const ctx = { locale: "en-US" };

describe("PasswordGenerator", () => {
  it("generates a password of the requested length", () => {
    const output = tool.execute(
      {
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      },
      ctx
    );
    expect(output.success).toBe(true);
    expect(output.data.password).toHaveLength(16);
  });

  it("only uses characters from the selected sets", () => {
    const output = tool.execute(
      {
        length: 20,
        includeUppercase: false,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
      },
      ctx
    );
    expect(output.data.password).toMatch(/^[a-z0-9]+$/);
  });

  it("guarantees at least one character from every selected set when length allows it", () => {
    const output = tool.execute(
      {
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      },
      ctx
    );
    const { password } = output.data;
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
  });

  it("returns a failure result when no character set is selected", () => {
    const output = tool.execute(
      {
        length: 12,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      },
      ctx
    );
    expect(output.success).toBe(false);
    expect(output.data.password).toBe("");
  });
});
