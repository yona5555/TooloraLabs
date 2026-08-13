import { describe, it, expect } from "vitest";
import { FileNameSanitizer } from "../FileNameSanitizer";

const tool = new FileNameSanitizer();
const ctx = { locale: "en-US" };

describe("FileNameSanitizer", () => {
  it("replaces spaces with the separator and lowercases by default", () => {
    const output = tool.execute({ fileName: "My Resume Final.PDF" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.result).toBe("my-resume-final.pdf");
    expect(output.data.changes).toContain("WHITESPACE");
  });

  it("removes characters illegal in file names", () => {
    const output = tool.execute({ fileName: 'bad:name?<>|.txt' }, ctx);
    expect(output.data.result).toBe("badname.txt");
    expect(output.data.changes).toContain("ILLEGAL_CHARS");
  });

  it("collapses multiple separators into one", () => {
    const output = tool.execute({ fileName: "a   b    c.txt" }, ctx);
    expect(output.data.result).toBe("a-b-c.txt");
  });

  it("supports underscore as the separator and preserving case", () => {
    const output = tool.execute(
      { fileName: "My File.txt", separator: "_", lowercase: false },
      ctx
    );
    expect(output.data.result).toBe("My_File.txt");
  });

  it("handles a file with no extension", () => {
    const output = tool.execute({ fileName: "README" }, ctx);
    expect(output.data.result).toBe("readme");
  });

  it("does not treat a leading dot (dotfile) as an extension separator", () => {
    const output = tool.execute({ fileName: ".gitignore" }, ctx);
    expect(output.data.result).toBe(".gitignore");
  });

  it("returns a failure result for empty input", () => {
    const output = tool.execute({ fileName: "   " }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("EMPTY_INPUT");
  });

  it("returns a failure result when nothing valid remains after sanitizing", () => {
    const output = tool.execute({ fileName: '???.txt' }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("INVALID_RESULT");
  });

  it("strips trailing dots left over from a name like \"notes..\"", () => {
    const output = tool.execute({ fileName: "notes.." }, ctx);
    expect(output.data.result).toBe("notes");
    expect(output.data.changes).toContain("TRAILING_DOTS_SPACES");
  });

  it("renames a Windows-reserved device name by appending a suffix", () => {
    const output = tool.execute({ fileName: "CON.txt" }, ctx);
    expect(output.data.result).toBe("con-file.txt");
    expect(output.data.changes).toContain("RESERVED_NAME");
  });

  it("does not flag a name that merely starts with a reserved word", () => {
    const output = tool.execute({ fileName: "console-log.txt" }, ctx);
    expect(output.data.result).toBe("console-log.txt");
    expect(output.data.changes).not.toContain("RESERVED_NAME");
  });

  it("transliterates accented characters to ASCII when enabled", () => {
    const output = tool.execute({ fileName: "café menu.pdf", transliterate: true }, ctx);
    expect(output.data.result).toBe("cafe-menu.pdf");
    expect(output.data.changes).toContain("DIACRITICS");
  });

  it("leaves accented characters untouched when transliteration is disabled", () => {
    const output = tool.execute({ fileName: "café.pdf" }, ctx);
    expect(output.data.result).toBe("café.pdf");
    expect(output.data.changes).not.toContain("DIACRITICS");
  });

  it("truncates a name that exceeds the max length while preserving the extension", () => {
    const longName = `${"a".repeat(300)}.txt`;
    const output = tool.execute({ fileName: longName }, ctx);
    expect(output.data.result.length).toBe(255);
    expect(output.data.result.endsWith(".txt")).toBe(true);
    expect(output.data.changes).toContain("TRUNCATED");
  });

  it("respects a custom maxLength", () => {
    const output = tool.execute({ fileName: "a-very-long-file-name.txt", maxLength: 10 }, ctx);
    expect(output.data.result.length).toBe(10);
    expect(output.data.changes).toContain("TRUNCATED");
  });
});
