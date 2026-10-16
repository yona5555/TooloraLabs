import { describe, it, expect } from "vitest";
import {
  authorListing,
  completeness,
  detectIdentifier,
  emptySource,
  formatInText,
  formatReference,
  normalizePages,
  parseDoi,
  parseIsbn,
  segmentsToHtml,
  segmentsToText,
  sortBibliography,
  sourceFromCrossref,
  sourceFromOpenLibrary,
  splitName,
  toBibtex,
  toRis,
  type CitationStyleId,
  type CiteSource,
} from "../CitationFormats";

const src = (o: Partial<CiteSource>): CiteSource => ({ ...emptySource("t"), ...o });
const ref = (s: CiteSource, style: CitationStyleId, i = 1) => segmentsToText(formatReference(s, style, i));

const article = src({
  type: "journal",
  authors: [
    { given: "Yann", family: "LeCun" },
    { given: "Yoshua", family: "Bengio" },
    { given: "Geoffrey", family: "Hinton" },
  ],
  title: "Deep learning",
  container: "Nature",
  year: "2015",
  month: "5",
  day: "28",
  volume: "521",
  issue: "7553",
  pages: "436-444",
  doi: "https://doi.org/10.1038/nature14539",
});

const book = src({
  type: "book",
  authors: [{ given: "Daniel", family: "Kahneman" }],
  title: "Thinking, fast and slow",
  publisher: "Farrar, Straus and Giroux",
  place: "New York",
  year: "2011",
});

const web = src({
  type: "website",
  authors: [{ given: "", family: "American Psychological Association" }],
  title: "Reference examples",
  container: "APA Style",
  url: "https://apastyle.apa.org/style-grammar-guidelines/references/examples",
  accessed: "2026-10-16",
});

const arabic = src({
  type: "book",
  authors: [{ given: "نجيب", family: "محفوظ" }],
  title: "بين القصرين",
  publisher: "مكتبة مصر",
  place: "القاهرة",
  year: "1956",
  edition: "2",
});

describe("CitationFormats - journal article", () => {
  it("APA 7", () => {
    expect(ref(article, "apa")).toBe(
      "LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. Nature, 521(7553), 436–444. https://doi.org/10.1038/nature14539",
    );
  });
  it("MLA 9", () => {
    expect(ref(article, "mla")).toBe(
      "LeCun, Yann, et al. “Deep learning.” Nature, vol. 521, no. 7553, 28 May 2015, pp. 436–444, https://doi.org/10.1038/nature14539.",
    );
  });
  it("Chicago 17 author-date", () => {
    expect(ref(article, "chicago")).toBe(
      "LeCun, Yann, Yoshua Bengio, and Geoffrey Hinton. 2015. “Deep learning.” Nature 521 (7553): 436–444. https://doi.org/10.1038/nature14539.",
    );
  });
  it("Harvard (Cite Them Right)", () => {
    expect(ref(article, "harvard")).toBe(
      "LeCun, Y., Bengio, Y. and Hinton, G. (2015) ‘Deep learning’, Nature, 521(7553), pp. 436–444. Available at: https://doi.org/10.1038/nature14539.",
    );
  });
  it("IEEE", () => {
    expect(ref(article, "ieee", 3)).toBe(
      "[3] Y. LeCun, Y. Bengio, and G. Hinton, “Deep learning,” Nature, vol. 521, no. 7553, pp. 436–444, May 2015, doi: 10.1038/nature14539.",
    );
  });
  it("italicizes the journal name and volume in APA", () => {
    expect(segmentsToHtml(formatReference(article, "apa"))).toContain("<i>Nature</i>, <i>521</i>(7553)");
  });
});

describe("CitationFormats - book", () => {
  it("formats in every style", () => {
    expect(ref(book, "apa")).toBe("Kahneman, D. (2011). Thinking, fast and slow. Farrar, Straus and Giroux.");
    expect(ref(book, "mla")).toBe("Kahneman, Daniel. Thinking, fast and slow. Farrar, Straus and Giroux, 2011.");
    expect(ref(book, "chicago")).toBe("Kahneman, Daniel. 2011. Thinking, fast and slow. New York: Farrar, Straus and Giroux.");
    expect(ref(book, "harvard")).toBe("Kahneman, D. (2011) Thinking, fast and slow. New York: Farrar, Straus and Giroux.");
    expect(ref(book, "ieee")).toBe("[1] D. Kahneman, Thinking, fast and slow. New York: Farrar, Straus and Giroux, 2011.");
  });
  it("adds the edition in each style's form", () => {
    const ed = { ...book, edition: "2" };
    expect(ref(ed, "apa")).toContain("Thinking, fast and slow (2nd ed.).");
    expect(ref(ed, "mla")).toContain("2nd ed., Farrar");
    expect(ref(ed, "harvard")).toContain("2nd edn.");
    expect(ref(ed, "ieee")).toContain("slow, 2nd ed.");
  });
});

describe("CitationFormats - web page without a date", () => {
  it("uses n.d. and the access date", () => {
    expect(ref(web, "apa")).toBe(
      "American Psychological Association. (n.d.). Reference examples. APA Style. Retrieved October 16, 2026, from https://apastyle.apa.org/style-grammar-guidelines/references/examples",
    );
    expect(ref(web, "mla")).toBe(
      "American Psychological Association. “Reference examples.” APA Style, apastyle.apa.org/style-grammar-guidelines/references/examples. Accessed 16 Oct. 2026.",
    );
    expect(ref(web, "harvard")).toBe(
      "American Psychological Association (no date) Reference examples. Available at: https://apastyle.apa.org/style-grammar-guidelines/references/examples (Accessed: 16 October 2026).",
    );
    expect(ref(web, "ieee")).toContain("(accessed Oct. 16, 2026).");
  });
});

describe("CitationFormats - Arabic sources", () => {
  it("keeps full given names and Arabic punctuation", () => {
    expect(ref(arabic, "apa")).toBe("محفوظ، نجيب. (1956). بين القصرين (ط. 2). مكتبة مصر.");
    expect(ref(arabic, "chicago")).toBe("محفوظ، نجيب. 1956. بين القصرين. ط. 2. القاهرة: مكتبة مصر.");
    expect(ref(arabic, "ieee")).toBe("[1] نجيب محفوظ، بين القصرين، ط. 2. القاهرة: مكتبة مصر، 1956.");
    expect(formatInText(arabic, "apa", { page: "45" })).toBe("(محفوظ، 1956، ص. 45)");
  });
  it("uses وآخرون for et al.", () => {
    const many = { ...arabic, authors: [1, 2, 3].map((i) => ({ given: "أحمد", family: `الاسم${i}` })) };
    expect(formatInText(many, "apa")).toBe("(الاسم1 وآخرون، 1956)");
  });
});

describe("CitationFormats - in-text citations", () => {
  it("handles author counts per style", () => {
    const two = { ...article, authors: article.authors.slice(0, 2) };
    expect(formatInText(two, "apa")).toBe("(LeCun & Bengio, 2015)");
    expect(formatInText(two, "apa", { narrative: true })).toBe("LeCun and Bengio (2015)");
    expect(formatInText(article, "apa", { page: "437" })).toBe("(LeCun et al., 2015, p. 437)");
    expect(formatInText(article, "mla", { page: "437" })).toBe("(LeCun et al. 437)");
    expect(formatInText(article, "chicago", { page: "437" })).toBe("(LeCun, Bengio, and Hinton 2015, 437)");
    expect(formatInText(article, "harvard")).toBe("(LeCun, Bengio and Hinton, 2015)");
    expect(formatInText(article, "ieee", { index: 4, page: "437-438" })).toBe("[4, pp. 437–438]");
  });
  it("falls back to the title without an author", () => {
    const anon = { ...web, authors: [{ given: "", family: "" }] };
    expect(formatInText(anon, "apa")).toBe("(“Reference examples”, n.d.)");
    expect(ref(anon, "apa").startsWith("Reference examples. (n.d.).")).toBe(true);
  });
});

describe("CitationFormats - author thresholds", () => {
  it("matches each style guide", () => {
    expect(authorListing("apa", 21)).toMatchObject({ refListed: 20, refEllipsis: true, inTextEtAl: true });
    expect(authorListing("apa", 20).refEllipsis).toBe(false);
    expect(authorListing("mla", 3)).toMatchObject({ refListed: 1, refEtAl: true });
    expect(authorListing("chicago", 10)).toMatchObject({ refListed: 10, refEtAl: false, inTextEtAl: true });
    expect(authorListing("chicago", 11)).toMatchObject({ refListed: 7, refEtAl: true });
    expect(authorListing("harvard", 4)).toMatchObject({ refListed: 1, refEtAl: true });
    expect(authorListing("ieee", 6).refEtAl).toBe(false);
    expect(authorListing("ieee", 7)).toMatchObject({ refListed: 1, refEtAl: true });
  });
  it("APA lists 19 authors, an ellipsis and the last one beyond 20", () => {
    const authors = Array.from({ length: 22 }, (_, i) => ({ given: "Ann", family: `Author${i + 1}` }));
    const text = ref({ ...article, authors }, "apa");
    expect(text).toContain("Author19, A., . . . Author22, A. (2015)");
    expect(text).not.toContain("Author20");
  });
});

describe("CitationFormats - DOI and ISBN", () => {
  it("extracts DOIs from any common form", () => {
    expect(parseDoi("https://doi.org/10.1038/nature14539")).toBe("10.1038/nature14539");
    expect(parseDoi("doi:10.1000/xyz123.")).toBe("10.1000/xyz123");
    expect(parseDoi("https://dx.doi.org/10.1145/3290605.3300233")).toBe("10.1145/3290605.3300233");
    expect(parseDoi("not a doi")).toBeNull();
  });
  it("validates ISBN-10 and ISBN-13 checksums", () => {
    expect(parseIsbn("978-0-374-27563-1")).toEqual({ isbn13: "9780374275631", isbn10: "0374275637" });
    expect(parseIsbn("0-306-40615-2")).toEqual({ isbn13: "9780306406157", isbn10: "0306406152" });
    expect(parseIsbn("080442957X")?.isbn13).toBe("9780804429573");
    expect(parseIsbn("9780374275632")).toBeNull();
    expect(parseIsbn("12345")).toBeNull();
  });
  it("detects which identifier was pasted", () => {
    expect(detectIdentifier("10.1038/nature14539")).toEqual({ kind: "doi", value: "10.1038/nature14539" });
    expect(detectIdentifier("ISBN 9780374275631")?.kind).toBe("isbn");
    expect(detectIdentifier("hello")).toBeNull();
  });
});

describe("CitationFormats - metadata mapping", () => {
  it("maps a Crossref work", () => {
    const s = sourceFromCrossref(
      {
        type: "journal-article",
        title: ["Deep learning"],
        author: [
          { given: "Yann", family: "LeCun" },
          { given: "Yoshua", family: "Bengio" },
        ],
        "container-title": ["Nature"],
        "published-print": { "date-parts": [[2015, 5, 28]] },
        volume: "521",
        issue: "7553",
        page: "436-444",
        DOI: "10.1038/nature14539",
      },
      "x",
    );
    expect(s).toMatchObject({ type: "journal", title: "Deep learning", container: "Nature", year: "2015", month: "5", pages: "436–444" });
    expect(s.authors[1]).toEqual({ given: "Yoshua", family: "Bengio" });
  });
  it("maps an Open Library book", () => {
    const s = sourceFromOpenLibrary(
      {
        title: "Thinking, fast and slow",
        authors: [{ name: "Daniel Kahneman" }],
        publishers: [{ name: "Farrar, Straus and Giroux" }],
        publish_places: [{ name: "New York" }],
        publish_date: "2011",
      },
      "9780374275631",
      "y",
    );
    expect(s).toMatchObject({ type: "book", publisher: "Farrar, Straus and Giroux", year: "2011", isbn: "9780374275631" });
    expect(s.authors[0]).toEqual({ given: "Daniel", family: "Kahneman" });
  });
  it("splits names in both orders", () => {
    expect(splitName("Doe, Jane A.")).toEqual({ family: "Doe", given: "Jane A." });
    expect(splitName("Jane A. Doe")).toEqual({ family: "Doe", given: "Jane A." });
    expect(splitName("UNESCO")).toEqual({ family: "UNESCO", given: "" });
  });
});

describe("CitationFormats - list tools and export", () => {
  it("sorts alphabetically, ignoring a leading article on titles", () => {
    const anon = src({ title: "The art of citing", year: "2020" });
    expect(sortBibliography([article, book, anon, web]).map((s) => s.title)).toEqual([
      "Reference examples",
      "The art of citing",
      "Thinking, fast and slow",
      "Deep learning",
    ]);
  });
  it("normalizes page ranges", () => {
    expect(normalizePages("436 - 444")).toBe("436–444");
  });
  it("scores completeness with required fields weighted double", () => {
    expect(completeness(article)).toBe(100);
    expect(completeness({ ...article, doi: "" })).toBe(92);
  });
  it("exports BibTeX", () => {
    const bib = toBibtex([article, arabic]);
    expect(bib).toContain("@article{lecun2015deep,");
    expect(bib).toContain("author = {LeCun, Yann and Bengio, Yoshua and Hinton, Geoffrey}");
    expect(bib).toContain("pages = {436--444}");
    expect(bib).toContain("doi = {10.1038/nature14539}");
    expect(bib).toContain("@book{ref1956,");
  });
  it("exports RIS with CRLF line endings", () => {
    const ris = toRis([article]);
    expect(ris.startsWith("TY  - JOUR\r\nAU  - LeCun, Yann\r\n")).toBe(true);
    expect(ris).toContain("SP  - 436\r\nEP  - 444");
    expect(ris.endsWith("ER  - \r\n")).toBe(true);
  });
});
