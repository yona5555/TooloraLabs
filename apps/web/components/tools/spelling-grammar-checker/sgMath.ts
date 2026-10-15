import { SpellingGrammarCalculator, type GrammarIssue, type IssueType } from "@tooloralabs/tools";

/**
 * Pure helpers for the spelling & grammar visuals. Every issue, suggestion and count shown comes from
 * the tool's own SpellingGrammarCalculator run on stored example text; the letter alignment is the
 * optimal-string-alignment edit distance between a typed word and the tool's own suggestion.
 */
export const sgTool = new SpellingGrammarCalculator();
export const check = (text: string) => sgTool.execute({ text }, { locale: "en-US" }).data;

export const ISSUE_TYPES: IssueType[] = ["spelling", "grammar", "capitalization", "punctuation"];
export const TYPE_COLOR: Record<IssueType, string> = {
  spelling: "var(--ai-d)",
  grammar: "var(--ai-a)",
  capitalization: "var(--ai-b)",
  punctuation: "var(--ai-e)",
};

/** Stored example for the Results card while the field is empty: one sentence per kind of slip. */
export const EXAMPLE =
  "i recieve alot of emails every day.  this is is a example of teh problem,it has a error. your going to love it. we will definately meet tommorow.";

/** Stored messy paragraph for the issue-type and scan cards. */
export const MESSY =
  "teh meeting is on monday.  i will send the the agenda tommorow. please bring a umbrella,it may rain. your going to need it. we recieve many questions about the begining of the project.";

/** A second stored paragraph for the rule-by-rule card. */
export const MESSY_B =
  "i think this is a example of how alot of people write.  the the results were wierd,but useful. your going to see more. thier answers suprise us.";

/** A clean stored paragraph and the eight misspellings injected into it, in order. */
export const CLEAN =
  "We will receive the final budget tomorrow. The team should definitely arrive on time. It is necessary to separate the old and new plans. Their notes will be useful until the end. The choice depends on the environment.";
export const INJECT: [string, string][] = [
  ["receive", "recieve"],
  ["tomorrow", "tommorow"],
  ["definitely", "definately"],
  ["necessary", "neccessary"],
  ["separate", "seperate"],
  ["Their", "Thier"],
  ["until", "untill"],
  ["environment", "enviroment"],
];

/** Misspellings from the tool's own list; their corrections come from running the tool. */
export const SPELL_LIST = ["teh", "recieve", "seperate", "definately", "occured", "untill", "wich", "thier", "adress", "beleive", "goverment", "neccessary", "tommorow", "wierd", "accomodate", "begining"];
export const suggestionFor = (w: string) => check(w).issues.find((i) => i.type === "spelling")?.suggestion ?? w;

/** Stored article phrases for the a / an card. */
export const ARTICLE_PHRASES = ["a apple", "an banana", "a university", "an hour", "a orange", "an car", "a honest", "an user"];
export const A_EXCEPTIONS = new Set(["university", "universal", "unique", "unicorn", "unanimous", "user", "useful", "european", "one", "once"]);
export const AN_EXCEPTIONS = new Set(["hour", "honest", "honor", "honorable", "heir"]);

/** Which of the tool's eight checks produced an issue (read from its type and message). */
export const RULES = ["misspelling", "pronounI", "sentenceStart", "spaces", "repeated", "spaceAfter", "article", "youre"] as const;
export type Rule = (typeof RULES)[number];
export function ruleOf(i: GrammarIssue): Rule {
  if (i.type === "spelling") return "misspelling";
  if (i.type === "capitalization") return i.message.includes('"I"') ? "pronounI" : "sentenceStart";
  if (i.type === "punctuation") return i.message.startsWith("Multiple") ? "spaces" : "spaceAfter";
  if (i.message.includes("repeated")) return "repeated";
  if (i.message.includes("you're")) return "youre";
  return "article";
}

export const sentencesOf = (text: string) => text.match(/[^.!?]+[.!?]+\s*/g) ?? [text];

/** First `n` words of `text`, keeping its own spacing up to the end of the n-th word. */
export function firstWords(text: string, n: number): string {
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  let end = 0;
  let k = 0;
  while (k < n && (m = re.exec(text)) !== null) {
    end = m.index + m[0].length;
    k++;
  }
  return text.slice(0, end);
}
export const wordTotal = (text: string) => (text.match(/\S+/g) ?? []).length;

/** Optimal string alignment (edits with adjacent swaps) and its step-by-step alignment. */
export type Op = { op: "match" | "sub" | "ins" | "del" | "swap"; a: string; b: string };
export function align(a: string, b: string): { dist: number; ops: Op[] } {
  const A = a.toLowerCase();
  const B = b.toLowerCase();
  const d: number[][] = Array.from({ length: A.length + 1 }, (_, i) => Array.from({ length: B.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= A.length; i++)
    for (let j = 1; j <= B.length; j++) {
      const c = A[i - 1] === B[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && A[i - 1] === B[j - 2] && A[i - 2] === B[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  const ops: Op[] = [];
  let i = A.length;
  let j = B.length;
  while (i > 0 || j > 0) {
    if (i > 1 && j > 1 && A[i - 1] === B[j - 2] && A[i - 2] === B[j - 1] && d[i][j] === d[i - 2][j - 2] + 1) {
      ops.unshift({ op: "swap", a: a.slice(i - 2, i), b: b.slice(j - 2, j) });
      i -= 2;
      j -= 2;
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1)) {
      ops.unshift({ op: A[i - 1] === B[j - 1] ? "match" : "sub", a: a[i - 1], b: b[j - 1] });
      i--;
      j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      ops.unshift({ op: "del", a: a[i - 1], b: "" });
      i--;
    } else {
      ops.unshift({ op: "ins", a: "", b: b[j - 1] });
      j--;
    }
  }
  return { dist: d[A.length][B.length], ops };
}
