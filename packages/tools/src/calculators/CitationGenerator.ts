import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type SourceType = "book" | "journal-article" | "website";

export type CitationAuthor = {
  firstName: string;
  lastName: string;
};

export type CitationGeneratorInput = {
  sourceType: SourceType;
  authors: CitationAuthor[];
  title: string;
  year: string;
  publisher?: string;
  journalName?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  siteName?: string;
  url?: string;
  accessDate?: string;
};

export type CitationGeneratorError = "missing-title" | "missing-journal-name" | "missing-url";

export type CitationGeneratorOutput = {
  error: CitationGeneratorError | null;
  errorDetail: string | null;
  apa: string | null;
  mla: string | null;
  chicago: string | null;
};

function initials(firstName: string): string {
  return firstName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join(" ");
}

function formatAuthorsApa(authors: CitationAuthor[]): string {
  const named = authors.filter((a) => a.lastName.trim());
  if (named.length === 0) return "";
  const formatted = named.map((a) => `${a.lastName.trim()}, ${initials(a.firstName)}`.trim());
  if (formatted.length === 1) return formatted[0];
  if (formatted.length <= 20) {
    const allButLast = formatted.slice(0, -1).join(", ");
    return `${allButLast}, & ${formatted[formatted.length - 1]}`;
  }
  const first19 = formatted.slice(0, 19).join(", ");
  return `${first19}, . . . ${formatted[formatted.length - 1]}`;
}

function formatAuthorsMla(authors: CitationAuthor[]): string {
  const named = authors.filter((a) => a.lastName.trim());
  if (named.length === 0) return "";
  const [first, second] = named;
  if (named.length === 1) return `${first.lastName.trim()}, ${first.firstName.trim()}.`;
  if (named.length === 2) return `${first.lastName.trim()}, ${first.firstName.trim()}, and ${second.firstName.trim()} ${second.lastName.trim()}.`;
  return `${first.lastName.trim()}, ${first.firstName.trim()}, et al.`;
}

function formatAuthorsChicago(authors: CitationAuthor[]): string {
  const named = authors.filter((a) => a.lastName.trim());
  if (named.length === 0) return "";
  const [first, second, third] = named;
  const firstPart = `${first.lastName.trim()}, ${first.firstName.trim()}`;
  if (named.length === 1) return `${firstPart}.`;
  if (named.length === 2) return `${firstPart}, and ${second.firstName.trim()} ${second.lastName.trim()}.`;
  if (named.length === 3) {
    return `${firstPart}, ${second.firstName.trim()} ${second.lastName.trim()}, and ${third.firstName.trim()} ${third.lastName.trim()}.`;
  }
  return `${firstPart}, et al.`;
}

function joinNonEmpty(parts: Array<string | undefined | null>, separator: string): string {
  return parts.filter((part) => part && part.trim()).join(separator);
}

function buildApa(input: CitationGeneratorInput): string {
  const authorsPart = formatAuthorsApa(input.authors);
  const year = input.year.trim() || "n.d.";
  const title = input.title.trim();

  if (input.sourceType === "book") {
    const lead = authorsPart ? `${authorsPart} (${year}).` : `${title}. (${year}).`;
    const body = authorsPart ? `${title}.` : "";
    return joinNonEmpty([lead, body, input.publisher?.trim() ? `${input.publisher.trim()}.` : ""], " ");
  }

  if (input.sourceType === "journal-article") {
    const lead = authorsPart ? `${authorsPart} (${year}).` : `${title}. (${year}).`;
    const body = authorsPart ? `${title}.` : "";
    const volIssue = input.volume?.trim()
      ? `${input.journalName?.trim() ?? ""}, ${input.volume.trim()}${input.issue?.trim() ? `(${input.issue.trim()})` : ""}${input.pages?.trim() ? `, ${input.pages.trim()}` : ""}.`
      : `${input.journalName?.trim() ?? ""}${input.pages?.trim() ? `, ${input.pages.trim()}` : ""}.`;
    return joinNonEmpty([lead, body, volIssue], " ");
  }

  const lead = authorsPart ? `${authorsPart} (${year}).` : `${title}. (${year}).`;
  const body = authorsPart ? `${title}.` : "";
  const siteAndUrl = joinNonEmpty([input.siteName?.trim() ? `${input.siteName.trim()}.` : "", input.url?.trim() ?? ""], " ");
  return joinNonEmpty([lead, body, siteAndUrl], " ");
}

function buildMla(input: CitationGeneratorInput): string {
  const authorsPart = formatAuthorsMla(input.authors);
  const year = input.year.trim();
  const title = input.title.trim();

  if (input.sourceType === "book") {
    const titlePart = `${title}.`;
    return joinNonEmpty([authorsPart, titlePart, joinNonEmpty([input.publisher?.trim(), year], ", ") + "."], " ");
  }

  if (input.sourceType === "journal-article") {
    const titlePart = `"${title}."`;
    const details = joinNonEmpty(
      [
        input.journalName?.trim(),
        input.volume?.trim() ? `vol. ${input.volume.trim()}` : "",
        input.issue?.trim() ? `no. ${input.issue.trim()}` : "",
        year,
        input.pages?.trim() ? `pp. ${input.pages.trim()}` : "",
      ],
      ", "
    );
    return joinNonEmpty([authorsPart, titlePart, `${details}.`], " ");
  }

  const titlePart = `"${title}."`;
  const details = joinNonEmpty([input.siteName?.trim(), year], ", ");
  const accessed = input.accessDate?.trim() ? `. Accessed ${input.accessDate.trim()}.` : ".";
  return joinNonEmpty([authorsPart, titlePart, details ? `${details},` : "", input.url?.trim() ?? ""], " ") + accessed;
}

function buildChicago(input: CitationGeneratorInput): string {
  const authorsPart = formatAuthorsChicago(input.authors);
  const year = input.year.trim() || "n.d.";
  const title = input.title.trim();

  if (input.sourceType === "book") {
    const lead = authorsPart ? `${authorsPart} ${year}.` : `${title}. ${year}.`;
    const body = authorsPart ? `${title}.` : "";
    return joinNonEmpty([lead, body, input.publisher?.trim() ? `${input.publisher.trim()}.` : ""], " ");
  }

  if (input.sourceType === "journal-article") {
    const lead = authorsPart ? `${authorsPart} ${year}.` : `${title}. ${year}.`;
    const body = authorsPart ? `"${title}."` : "";
    const volIssue = joinNonEmpty(
      [input.journalName?.trim(), input.volume?.trim() ? `${input.volume.trim()}${input.issue?.trim() ? ` (${input.issue.trim()})` : ""}` : ""],
      " "
    );
    const pagesPart = input.pages?.trim() ? `: ${input.pages.trim()}` : "";
    return joinNonEmpty([lead, body, `${volIssue}${pagesPart}.`], " ");
  }

  const lead = authorsPart ? `${authorsPart} ${year}.` : `${title}. ${year}.`;
  const body = authorsPart ? `"${title}."` : "";
  const sitePart = input.siteName?.trim() ? `${input.siteName.trim()}.` : "";
  const accessedPrefix = input.accessDate?.trim() ? `Accessed ${input.accessDate.trim()}. ` : "";
  return joinNonEmpty([lead, body, sitePart, `${accessedPrefix}${input.url?.trim() ?? ""}`], " ");
}

/**
 * Formats a source's bibliographic details into APA 7th edition, MLA 9th
 * edition, and Chicago (author-date, 17th edition) reference-list entries.
 * Author-list formatting follows each style's own rules for author counts
 * (e.g. APA's "&" before the final author vs. MLA/Chicago's "and", and each
 * style's own et-al. threshold), and sources with no listed author lead
 * with the title instead, per all three styles' own conventions.
 */
export class CitationGenerator extends BaseCalculator<CitationGeneratorInput, CitationGeneratorOutput> {
  metadata = {
    id: "citation-generator",
    slug: "citation-generator",
    name: "Citation Generator",
    category: "text-tools",
    description: "Generate APA, MLA, and Chicago style citations for books, journal articles, and websites.",
    version: "1.0.0",
  };

  execute(input: CitationGeneratorInput, _context: ToolContext): ToolResult<CitationGeneratorOutput> {
    if (!input.title.trim()) {
      return this.errorResult("missing-title", "Enter a title for the source.");
    }
    if (input.sourceType === "journal-article" && !input.journalName?.trim()) {
      return this.errorResult("missing-journal-name", "Enter the name of the journal this article was published in.");
    }
    if (input.sourceType === "website" && !input.url?.trim()) {
      return this.errorResult("missing-url", "Enter the URL of the web page.");
    }

    return this.ok({
      apa: buildApa(input),
      mla: buildMla(input),
      chicago: buildChicago(input),
    });
  }

  private ok(data: { apa: string; mla: string; chicago: string }): ToolResult<CitationGeneratorOutput> {
    return {
      success: true,
      data: { error: null, errorDetail: null, apa: data.apa, mla: data.mla, chicago: data.chicago },
      metadata: {},
    };
  }

  private errorResult(error: CitationGeneratorError, detail: string): ToolResult<CitationGeneratorOutput> {
    return {
      success: true,
      data: { error, errorDetail: detail, apa: null, mla: null, chicago: null },
      metadata: {},
    };
  }
}
