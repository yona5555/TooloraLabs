import { describe, expect, it } from "vitest";
import { SpellingGrammarCalculator, type GrammarIssue, type IssueType } from "../SpellingGrammarCalculator";

const ctx = { locale: "en-US" };

function findType(issues: GrammarIssue[], type: IssueType) {
  return issues.filter((i) => i.type === type);
}

describe("SpellingGrammarCalculator", () => {
  const tool = new SpellingGrammarCalculator();

  it("rejects empty text", () => {
    const result = tool.execute({ text: "   " }, ctx);
    expect(result.data.error).toBe("empty-text");
  });

  it("returns no issues for clean text", () => {
    const result = tool.execute({ text: "This is a well written sentence." }, ctx);
    expect(result.data.issues).toEqual([]);
  });

  it("detects a common misspelling", () => {
    const result = tool.execute({ text: "I will recieve the package tomorrow." }, ctx);
    const spelling = findType(result.data.issues, "spelling");
    expect(spelling).toHaveLength(1);
    expect(spelling[0].original).toBe("recieve");
    expect(spelling[0].suggestion).toBe("receive");
  });

  it("preserves capitalization in spelling suggestions", () => {
    const result = tool.execute({ text: "Teh cat sat down." }, ctx);
    const spelling = findType(result.data.issues, "spelling");
    expect(spelling[0].original).toBe("Teh");
    expect(spelling[0].suggestion).toBe("The");
  });

  it("flags a standalone lowercase i", () => {
    const result = tool.execute({ text: "Yesterday i went to the store." }, ctx);
    const caps = findType(result.data.issues, "capitalization");
    expect(caps.some((issue) => issue.original === "i" && issue.suggestion === "I")).toBe(true);
  });

  it("flags missing capitalization at the start of a sentence", () => {
    const result = tool.execute({ text: "hello there." }, ctx);
    const caps = findType(result.data.issues, "capitalization");
    expect(caps.some((issue) => issue.suggestion === "H")).toBe(true);
  });

  it("flags missing capitalization after a sentence-ending period", () => {
    const result = tool.execute({ text: "Hello there. how are you?" }, ctx);
    const caps = findType(result.data.issues, "capitalization");
    expect(caps.some((issue) => issue.suggestion === "H" && issue.start > 0)).toBe(true);
  });

  it("flags multiple consecutive spaces", () => {
    const result = tool.execute({ text: "Hello  world." }, ctx);
    const punctuation = findType(result.data.issues, "punctuation");
    expect(punctuation.some((issue) => issue.original === "  ")).toBe(true);
  });

  it("flags a repeated word", () => {
    const result = tool.execute({ text: "This is the the best." }, ctx);
    const grammar = findType(result.data.issues, "grammar");
    expect(grammar.some((issue) => issue.message.includes("the"))).toBe(true);
  });

  it("flags missing space after punctuation", () => {
    const result = tool.execute({ text: "Hello,world." }, ctx);
    const punctuation = findType(result.data.issues, "punctuation");
    expect(punctuation.some((issue) => issue.original === ",w")).toBe(true);
  });

  it("suggests 'an' before a vowel-starting word", () => {
    const result = tool.execute({ text: "I saw a elephant." }, ctx);
    const grammar = findType(result.data.issues, "grammar");
    expect(grammar.some((issue) => issue.original === "a" && issue.suggestion === "an")).toBe(true);
  });

  it("does not flag 'a' before known exceptions", () => {
    const result = tool.execute({ text: "She is a university student." }, ctx);
    const grammar = findType(result.data.issues, "grammar");
    expect(grammar.some((issue) => issue.suggestion === "an")).toBe(false);
  });

  it("suggests 'a' before a consonant-starting word after 'an'", () => {
    const result = tool.execute({ text: "I saw an dog." }, ctx);
    const grammar = findType(result.data.issues, "grammar");
    expect(grammar.some((issue) => issue.original === "an" && issue.suggestion === "a")).toBe(true);
  });

  it("does not flag 'an' before known exceptions", () => {
    const result = tool.execute({ text: "Wait an hour please." }, ctx);
    const grammar = findType(result.data.issues, "grammar");
    expect(grammar.some((issue) => issue.suggestion === "a")).toBe(false);
  });

  it("flags a likely your/you're confusion", () => {
    const result = tool.execute({ text: "your going to love this." }, ctx);
    const grammar = findType(result.data.issues, "grammar");
    expect(grammar.some((issue) => issue.suggestion === "you're")).toBe(true);
  });

  it("counts words correctly", () => {
    const result = tool.execute({ text: "The quick brown fox jumps." }, ctx);
    expect(result.data.wordCount).toBe(5);
  });

  it("sorts issues by position in the text", () => {
    const result = tool.execute({ text: "teh cat  sat. teh dog ran." }, ctx);
    const starts = result.data.issues.map((i) => i.start);
    const sorted = [...starts].sort((a, b) => a - b);
    expect(starts).toEqual(sorted);
  });
});
