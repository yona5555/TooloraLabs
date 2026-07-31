import { describe, it, expect } from "vitest";
import { FileNameSanitizer } from "../FileNameSanitizer";

const tool = new FileNameSanitizer();
const ctx = { locale: "en-US" };

describe("FileNameSanitizer", () => {
  it("replaces spaces with the separator and lowercases by default", () => {
    const output = tool.execute({ fileName: "My Resume Final.PDF" }, ctx);
    expect(output.success).toBe(true);
    expect(output.data.result).toBe("my-resume-final.pdf");
  });

  it("removes characters illegal in file names", () => {
    const output = tool.execute({ fileName: 'bad:name?<>|.txt' }, ctx);
    expect(output.data.result).toBe("badname.txt");
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
});
