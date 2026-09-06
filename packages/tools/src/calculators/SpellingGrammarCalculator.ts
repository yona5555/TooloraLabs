import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type IssueType = "spelling" | "grammar" | "capitalization" | "punctuation";

export type GrammarIssue = {
  type: IssueType;
  message: string;
  start: number;
  end: number;
  original: string;
  suggestion: string | null;
};

export type SpellingGrammarInput = {
  text: string;
};

export type SpellingGrammarError = "empty-text";

export type SpellingGrammarOutput = {
  error: SpellingGrammarError | null;
  issues: GrammarIssue[];
  wordCount: number;
};

/** A small set of commonly misspelled English words. Not exhaustive — this is a basic
 * rule-based checker, not a full dictionary-backed spellchecker. */
const MISSPELLED_WORDS: Record<string, string> = {
  teh: "the",
  recieve: "receive",
  seperate: "separate",
  definately: "definitely",
  occured: "occurred",
  untill: "until",
  wich: "which",
  alot: "a lot",
  thier: "their",
  adress: "address",
  beleive: "believe",
  goverment: "government",
  neccessary: "necessary",
  acheive: "achieve",
  arguement: "argument",
  calender: "calendar",
  concious: "conscious",
  embarass: "embarrass",
  enviroment: "environment",
  existance: "existence",
  grammer: "grammar",
  independant: "independent",
  occassion: "occasion",
  priviledge: "privilege",
  publically: "publicly",
  recomend: "recommend",
  rythm: "rhythm",
  sucessful: "successful",
  tommorow: "tomorrow",
  wierd: "weird",
  accomodate: "accommodate",
  begining: "beginning",
  commited: "committed",
  dissapear: "disappear",
  finaly: "finally",
  happend: "happened",
  intrested: "interested",
  knowlege: "knowledge",
  liesure: "leisure",
  maintainance: "maintenance",
  noticable: "noticeable",
  ocurred: "occurred",
  posession: "possession",
  reccomend: "recommend",
  suprise: "surprise",
  truely: "truly",
};

/** Words that start with a vowel letter but a consonant sound, so "a" (not "an") is correct. */
const A_EXCEPTIONS = new Set(["university", "universal", "unique", "unicorn", "unanimous", "user", "useful", "european", "one", "once"]);
/** Words that start with a silent "h" (vowel sound), so "an" (not "a") is correct. */
const AN_EXCEPTIONS = new Set(["hour", "honest", "honor", "honorable", "heir"]);

function preserveCase(original: string, replacement: string): string {
  if (original[0] && original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function findMisspellings(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const wordPattern = /[A-Za-z']+/g;
  let match: RegExpExecArray | null;
  while ((match = wordPattern.exec(text)) !== null) {
    const word = match[0];
    const lower = word.toLowerCase();
    const correction = MISSPELLED_WORDS[lower];
    if (correction) {
      issues.push({
        type: "spelling",
        message: `"${word}" may be misspelled.`,
        start: match.index,
        end: match.index + word.length,
        original: word,
        suggestion: preserveCase(word, correction),
      });
    }
  }
  return issues;
}

function findLowercaseI(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const pattern = /\bi\b/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    issues.push({
      type: "capitalization",
      message: `The pronoun "I" should be capitalized.`,
      start: match.index,
      end: match.index + 1,
      original: "i",
      suggestion: "I",
    });
  }
  return issues;
}

function findSentenceCapitalization(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const pattern = /(^\s*[a-z])|([.!?]\s+[a-z])/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const letterIndex = match.index + match[0].length - 1;
    const letter = text[letterIndex];
    issues.push({
      type: "capitalization",
      message: "Sentences should start with a capital letter.",
      start: letterIndex,
      end: letterIndex + 1,
      original: letter,
      suggestion: letter.toUpperCase(),
    });
  }
  return issues;
}

function findMultipleSpaces(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const pattern = /[ \t]{2,}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    issues.push({
      type: "punctuation",
      message: "Multiple consecutive spaces found.",
      start: match.index,
      end: match.index + match[0].length,
      original: match[0],
      suggestion: " ",
    });
  }
  return issues;
}

function findRepeatedWords(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const pattern = /\b([A-Za-z']+)([ \t]+)\1\b/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    issues.push({
      type: "grammar",
      message: `The word "${match[1]}" is repeated.`,
      start: match.index,
      end: match.index + match[0].length,
      original: match[0],
      suggestion: match[1],
    });
  }
  return issues;
}

function findMissingSpaceAfterPunctuation(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const pattern = /[.,!?][A-Za-z]/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    issues.push({
      type: "punctuation",
      message: "Add a space after punctuation.",
      start: match.index,
      end: match.index + match[0].length,
      original: match[0],
      suggestion: `${match[0][0]} ${match[0][1]}`,
    });
  }
  return issues;
}

function findArticleErrors(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  const aPattern = /\ba\s+([aeiouAEIOU][A-Za-z']*)\b/g;
  let match: RegExpExecArray | null;
  while ((match = aPattern.exec(text)) !== null) {
    const word = match[1].toLowerCase();
    if (A_EXCEPTIONS.has(word)) continue;
    issues.push({
      type: "grammar",
      message: `Use "an" before a word that starts with a vowel sound.`,
      start: match.index,
      end: match.index + 1,
      original: "a",
      suggestion: "an",
    });
  }

  const anPattern = /\ban\s+([b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z][A-Za-z']*)\b/g;
  while ((match = anPattern.exec(text)) !== null) {
    const word = match[1].toLowerCase();
    if (AN_EXCEPTIONS.has(word)) continue;
    issues.push({
      type: "grammar",
      message: `Use "a" before a word that starts with a consonant sound.`,
      start: match.index,
      end: match.index + 2,
      original: "an",
      suggestion: "a",
    });
  }

  return issues;
}

function findYourYoureConfusion(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  const pattern = /\byour\s+(\w+ing)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    issues.push({
      type: "grammar",
      message: `Did you mean "you're" (you are)?`,
      start: match.index,
      end: match.index + 4,
      original: match[0].slice(0, 4),
      suggestion: "you're",
    });
  }
  return issues;
}

export class SpellingGrammarCalculator extends BaseCalculator<SpellingGrammarInput, SpellingGrammarOutput> {
  metadata = {
    id: "spelling-grammar-checker",
    slug: "spelling-grammar-checker",
    name: "Spelling & Grammar Checker",
    category: "ai-tools",
    description: "Check text for common spelling mistakes and basic grammar issues, entirely in your browser.",
    version: "1.0.0",
  };

  execute(input: SpellingGrammarInput, _context: ToolContext): ToolResult<SpellingGrammarOutput> {
    const text = input.text ?? "";
    if (!text.trim()) {
      return {
        success: true,
        data: { error: "empty-text", issues: [], wordCount: 0 },
        metadata: {},
      };
    }

    const issues = [
      ...findMisspellings(text),
      ...findLowercaseI(text),
      ...findSentenceCapitalization(text),
      ...findMultipleSpaces(text),
      ...findRepeatedWords(text),
      ...findMissingSpaceAfterPunctuation(text),
      ...findArticleErrors(text),
      ...findYourYoureConfusion(text),
    ].sort((a, b) => a.start - b.start);

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    return {
      success: true,
      data: { error: null, issues, wordCount },
      metadata: {},
    };
  }
}
