import { describe, expect, it } from "vitest";
import { analyzeFileName, checkPlatforms, classifyChar, nameLengths } from "../fileNameAnalysis";
import { FileNameSanitizer } from "../FileNameSanitizer";

const input = { fileName: "  Résumé: Final Draft?? (v2)..PDF ", separator: "-" as const, lowercase: true, transliterate: true };

describe("fileNameAnalysis", () => {
  it("classifies characters", () => {
    expect(classifyChar("é")).toBe("accented");
    expect(classifyChar("م")).toBe("nonLatin");
    expect(classifyChar("?")).toBe("illegal");
    expect(classifyChar("(")).toBe("punct");
    expect(classifyChar(" ")).toBe("space");
  });

  it("checks platforms", () => {
    const c = checkPlatforms("CON.txt");
    expect(c.find((p) => p.platform === "windows")?.reasons).toEqual(["reserved"]);
    expect(c.find((p) => p.platform === "linux")?.ok).toBe(true);
    expect(checkPlatforms("a:b").find((p) => p.platform === "macos")?.ok).toBe(false);
    expect(checkPlatforms("report-2026.pdf").every((p) => p.ok)).toBe(true);
  });

  it("measures lengths and runs the pipeline to the tool's own result", () => {
    expect(nameLengths("é")).toEqual({ chars: 1, utf8: 2, utf16: 1, url: 6 });
    const result = new FileNameSanitizer().execute(input, { locale: "en-US" }).data.result;
    const a = analyzeFileName(input, result);
    expect(a.stages[a.stages.length - 1].value).toBe(result);
    expect(a.stages[1].value.startsWith("Resume")).toBe(true);
    expect(a.original.find((p) => p.platform === "windows")?.ok).toBe(false);
    expect(a.sanitized.filter((p) => p.platform !== "url").every((p) => p.ok)).toBe(true);
    // Parentheses are legal file-name characters but must be percent-encoded in a URL.
    expect(a.sanitized.find((p) => p.platform === "url")?.ok).toBe(false);
    expect(result).toBe("resume-final-draft-(v2).pdf");
    expect(a.classCounts.illegal).toBe(3);
    expect(a.extension).toBe("pdf");
  });
});
