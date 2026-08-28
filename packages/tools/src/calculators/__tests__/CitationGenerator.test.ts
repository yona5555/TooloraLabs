import { describe, expect, it } from "vitest";
import { CitationGenerator, type CitationGeneratorInput } from "../CitationGenerator";

const tool = new CitationGenerator();

function run(input: CitationGeneratorInput) {
  return tool.execute(input, { locale: "en-US" }).data;
}

const base: CitationGeneratorInput = {
  sourceType: "book",
  authors: [{ firstName: "Jane", lastName: "Doe" }],
  title: "The Craft of Research",
  year: "2020",
  publisher: "University Press",
};

describe("CitationGenerator - book", () => {
  it("formats a single-author book in APA, MLA, and Chicago", () => {
    const result = run(base);
    expect(result.error).toBeNull();
    expect(result.apa).toBe("Doe, J. (2020). The Craft of Research. University Press.");
    expect(result.mla).toBe("Doe, Jane. The Craft of Research. University Press, 2020.");
    expect(result.chicago).toBe("Doe, Jane. 2020. The Craft of Research. University Press.");
  });

  it("formats a two-author book", () => {
    const result = run({
      ...base,
      authors: [
        { firstName: "Jane", lastName: "Doe" },
        { firstName: "John", lastName: "Smith" },
      ],
    });
    expect(result.apa).toBe("Doe, J., & Smith, J. (2020). The Craft of Research. University Press.");
    expect(result.mla).toBe("Doe, Jane, and John Smith. The Craft of Research. University Press, 2020.");
    expect(result.chicago).toBe("Doe, Jane, and John Smith. 2020. The Craft of Research. University Press.");
  });

  it("formats a three-author book (Chicago spells out all three, MLA uses et al.)", () => {
    const result = run({
      ...base,
      authors: [
        { firstName: "Jane", lastName: "Doe" },
        { firstName: "John", lastName: "Smith" },
        { firstName: "Ana", lastName: "Ruiz" },
      ],
    });
    expect(result.apa).toBe("Doe, J., Smith, J., & Ruiz, A. (2020). The Craft of Research. University Press.");
    expect(result.mla).toBe("Doe, Jane, et al. The Craft of Research. University Press, 2020.");
    expect(result.chicago).toBe("Doe, Jane, John Smith, and Ana Ruiz. 2020. The Craft of Research. University Press.");
  });

  it("formats a four-author book (Chicago also switches to et al.)", () => {
    const result = run({
      ...base,
      authors: [
        { firstName: "Jane", lastName: "Doe" },
        { firstName: "John", lastName: "Smith" },
        { firstName: "Ana", lastName: "Ruiz" },
        { firstName: "Kim", lastName: "Park" },
      ],
    });
    expect(result.chicago).toBe("Doe, Jane, et al. 2020. The Craft of Research. University Press.");
  });

  it("moves the title to the author position when no author is given", () => {
    const result = run({ ...base, authors: [{ firstName: "", lastName: "" }] });
    expect(result.apa).toBe("The Craft of Research. (2020). University Press.");
    expect(result.mla).toBe("The Craft of Research. University Press, 2020.");
    expect(result.chicago).toBe("The Craft of Research. 2020. University Press.");
  });
});

describe("CitationGenerator - journal article", () => {
  const journal: CitationGeneratorInput = {
    sourceType: "journal-article",
    authors: [{ firstName: "Jane", lastName: "Doe" }],
    title: "A Study of Structured Data",
    year: "2019",
    journalName: "Journal of Information Science",
    volume: "12",
    issue: "3",
    pages: "45-60",
  };

  it("formats a journal article in all three styles", () => {
    const result = run(journal);
    expect(result.error).toBeNull();
    expect(result.apa).toBe("Doe, J. (2019). A Study of Structured Data. Journal of Information Science, 12(3), 45-60.");
    expect(result.mla).toBe('Doe, Jane. "A Study of Structured Data." Journal of Information Science, vol. 12, no. 3, 2019, pp. 45-60.');
    expect(result.chicago).toBe('Doe, Jane. 2019. "A Study of Structured Data." Journal of Information Science 12 (3): 45-60.');
  });

  it("requires a journal name", () => {
    const result = run({ ...journal, journalName: "" });
    expect(result.error).toBe("missing-journal-name");
    expect(result.apa).toBeNull();
  });
});

describe("CitationGenerator - website", () => {
  const website: CitationGeneratorInput = {
    sourceType: "website",
    authors: [{ firstName: "Jane", lastName: "Doe" }],
    title: "How Citation Styles Work",
    year: "2023",
    siteName: "TooloraLabs",
    url: "https://tooloralabs.com/citation-styles",
    accessDate: "January 5, 2024",
  };

  it("formats a website citation in all three styles", () => {
    const result = run(website);
    expect(result.error).toBeNull();
    expect(result.apa).toBe("Doe, J. (2023). How Citation Styles Work. TooloraLabs. https://tooloralabs.com/citation-styles");
    expect(result.mla).toBe(
      'Doe, Jane. "How Citation Styles Work." TooloraLabs, 2023, https://tooloralabs.com/citation-styles. Accessed January 5, 2024.'
    );
    expect(result.chicago).toBe(
      'Doe, Jane. 2023. "How Citation Styles Work." TooloraLabs. Accessed January 5, 2024. https://tooloralabs.com/citation-styles'
    );
  });

  it("requires a URL", () => {
    const result = run({ ...website, url: "" });
    expect(result.error).toBe("missing-url");
  });
});

describe("CitationGenerator - validation", () => {
  it("requires a title", () => {
    const result = run({ ...base, title: "" });
    expect(result.error).toBe("missing-title");
    expect(result.apa).toBeNull();
    expect(result.mla).toBeNull();
    expect(result.chicago).toBeNull();
  });
});
