import { describe, expect, it } from "vitest";
import { NotepadCalculator } from "../NotepadCalculator";

const tool = new NotepadCalculator();
function run(text: string) {
  return tool.execute({ text }, { locale: "en-US" }).data.lines;
}

describe("NotepadCalculator", () => {
  it("evaluates a plain arithmetic line", () => {
    const lines = run("2 + 2");
    expect(lines[0].result).toBe("4");
  });

  it("leaves prose lines with no result", () => {
    const lines = run("Grocery budget for the week");
    expect(lines[0].result).toBeNull();
  });

  it("remembers a variable assignment for later lines", () => {
    const lines = run("price = 20\nprice * 3");
    expect(lines[0].result).toBe("20");
    expect(lines[1].result).toBe("60");
  });

  it("carries multiple variables across lines", () => {
    const lines = run("a = 5\nb = 10\na + b");
    expect(lines[2].result).toBe("15");
  });

  it("mixes prose and calculations in the same document", () => {
    const lines = run("Rent Calculation\nrent = 1200\nsplit between 3 people:\nrent / 3");
    expect(lines[0].result).toBeNull();
    expect(lines[1].result).toBe("1200");
    expect(lines[2].result).toBeNull();
    expect(lines[3].result).toBe("400");
  });

  it("preserves blank lines with no result", () => {
    const lines = run("1 + 1\n\n2 + 2");
    expect(lines).toHaveLength(3);
    expect(lines[1].result).toBeNull();
  });

  it("does not carry a variable forward if its definition fails to evaluate", () => {
    const lines = run("x = 1 +\nx");
    expect(lines[0].result).toBeNull();
    expect(lines[1].result).toBeNull(); // x was never successfully defined
  });
});
