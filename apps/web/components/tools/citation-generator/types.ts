import type { SourceType, CitationAuthor } from "@tooloralabs/tools";
export type {
  SourceType,
  CitationAuthor,
  CitationGeneratorError,
  CitationGeneratorOutput as CitationResult,
} from "@tooloralabs/tools";

export function emptyAuthor(): { firstName: string; lastName: string } {
  return { firstName: "", lastName: "" };
}

export type CitationDraft = {
  sourceType: SourceType;
  authors: CitationAuthor[];
  title: string;
  year: string;
  publisher: string;
  journalName: string;
  volume: string;
  issue: string;
  pages: string;
  siteName: string;
  url: string;
  accessDate: string;
};

export const EMPTY_CITATION_DRAFT: CitationDraft = {
  sourceType: "book",
  authors: [emptyAuthor()],
  title: "",
  year: "",
  publisher: "",
  journalName: "",
  volume: "",
  issue: "",
  pages: "",
  siteName: "",
  url: "",
  accessDate: "",
};

export type CitationScenario = { key: string; draft: CitationDraft };

/** Real, complete worked examples covering each source type this tool supports. */
export const CITATION_SCENARIOS: CitationScenario[] = [
  {
    key: "bookExample",
    draft: {
      sourceType: "book",
      authors: [{ firstName: "Jane", lastName: "Doe" }],
      title: "The Craft of Research",
      year: "2020",
      publisher: "University of Chicago Press",
      journalName: "",
      volume: "",
      issue: "",
      pages: "",
      siteName: "",
      url: "",
      accessDate: "",
    },
  },
  {
    key: "journalExample",
    draft: {
      sourceType: "journal-article",
      authors: [{ firstName: "Alan", lastName: "Turing" }],
      title: "Computing Machinery and Intelligence",
      year: "1950",
      publisher: "",
      journalName: "Mind",
      volume: "59",
      issue: "236",
      pages: "433-460",
      siteName: "",
      url: "",
      accessDate: "",
    },
  },
  {
    key: "websiteExample",
    draft: {
      sourceType: "website",
      authors: [{ firstName: "Maria", lastName: "Alvarez" }],
      title: "Understanding Climate Change",
      year: "2023",
      publisher: "",
      journalName: "",
      volume: "",
      issue: "",
      pages: "",
      siteName: "National Geographic",
      url: "https://www.nationalgeographic.com/climate-change",
      accessDate: "2024-03-15",
    },
  },
];

export type CitationCompletenessBand = "incomplete" | "mostlyComplete" | "complete";

export function bandForCompleteness(percent: number): CitationCompletenessBand {
  if (percent >= 90) return "complete";
  if (percent >= 60) return "mostlyComplete";
  return "incomplete";
}

/** How many of the fields a citation of this source type actually needs are filled in — a genuine completeness signal, not just pass/fail on the one or two fields the engine strictly requires. */
export function citationCompleteness(draft: CitationDraft): { percent: number; filled: number; total: number } {
  const has = (value: string) => value.trim().length > 0;
  const hasAuthor = draft.authors.some((a) => has(a.lastName));

  const fields =
    draft.sourceType === "book"
      ? [hasAuthor, has(draft.title), has(draft.year), has(draft.publisher)]
      : draft.sourceType === "journal-article"
        ? [hasAuthor, has(draft.title), has(draft.year), has(draft.journalName), has(draft.volume), has(draft.issue), has(draft.pages)]
        : [hasAuthor, has(draft.title), has(draft.siteName), has(draft.url), has(draft.accessDate)];

  const filled = fields.filter(Boolean).length;
  return { percent: (filled / fields.length) * 100, filled, total: fields.length };
}
