/**
 * Pure citation formatting for five styles, with Arabic-source support, DOI/ISBN parsing,
 * Crossref / Open Library metadata mapping and BibTeX / RIS export.
 *
 * Style rules (checked against the official guides):
 * - APA 7: Publication Manual of the APA, 7th ed. (2020), §9.8 (up to 20 authors, then
 *   19 + ". . ." + last), §8.17 (in-text: 1–2 names, 3+ "et al."), sentence elements order.
 * - MLA 9: MLA Handbook, 9th ed. (2021): 1 or 2 authors listed, 3+ "et al."; container
 *   elements "vol., no., date, pp."; abbreviated months; URLs without the protocol.
 * - Chicago 17 (author-date): Chicago Manual of Style, 17th ed., §15.9 (up to 10 authors
 *   listed; 11+ → first 7 + "et al."), §15.29 (in-text: up to 3 names, 4+ "et al.").
 * - Harvard: Cite Them Right, 12th ed. (Pears & Shields, 2022): "edn", "Available at:",
 *   "(Accessed: …)", 4+ authors → "et al." in text and reference list.
 * - IEEE: IEEE Reference Guide (IEEE Periodicals, 2023): initials before surname, up to 6
 *   authors (7+ → first + "et al."), numbered in order of citation.
 *
 * Arabic sources (Arabic script in the title or an author name) keep full given names (Arabic
 * names have no reliable initials) and use Arabic punctuation and terms (، و وآخرون د.ت. ط.).
 */

export type CitationStyleId = "apa" | "mla" | "chicago" | "harvard" | "ieee";
export const CITATION_STYLES: CitationStyleId[] = ["apa", "mla", "chicago", "harvard", "ieee"];

export type CiteSourceType = "journal" | "book" | "website";
export const CITE_SOURCE_TYPES: CiteSourceType[] = ["journal", "book", "website"];

/** An author with an empty `given` is treated as an organization (corporate author). */
export type CiteAuthor = { given: string; family: string };

export type CiteSource = {
  id: string;
  type: CiteSourceType;
  authors: CiteAuthor[];
  title: string;
  /** Journal name for articles, website name for web pages. */
  container: string;
  publisher: string;
  place: string;
  year: string;
  month: string;
  day: string;
  volume: string;
  issue: string;
  pages: string;
  edition: string;
  doi: string;
  isbn: string;
  url: string;
  /** Access date, ISO YYYY-MM-DD. */
  accessed: string;
};

export type CitePart =
  | "author"
  | "date"
  | "title"
  | "container"
  | "edition"
  | "publisher"
  | "locator"
  | "identifier"
  | "access"
  | "number"
  | "punct";

export type CiteSegment = { text: string; part: CitePart; italic?: boolean };

export function emptySource(id: string, type: CiteSourceType = "journal"): CiteSource {
  return {
    id,
    type,
    authors: [{ given: "", family: "" }],
    title: "",
    container: "",
    publisher: "",
    place: "",
    year: "",
    month: "",
    day: "",
    volume: "",
    issue: "",
    pages: "",
    edition: "",
    doi: "",
    isbn: "",
    url: "",
    accessed: "",
  };
}

/* ------------------------------------------------------------------ language */

const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function hasArabic(text: string): boolean {
  return ARABIC_RE.test(text);
}

export function sourceLang(s: CiteSource): "ar" | "en" {
  return hasArabic(s.title) || s.authors.some((a) => hasArabic(a.family) || hasArabic(a.given)) ? "ar" : "en";
}

type Terms = {
  comma: string;
  and: (name: string) => string;
  amp: (name: string) => string;
  etAl: string;
  nd: string;
  harvardNd: string;
  edition: (n: string, style: CitationStyleId) => string;
  vol: string;
  no: string;
  pp: string;
  p: string;
  accessed: string;
  harvardAccessed: string;
  available: string;
  retrieved: (date: string, url: string) => string;
  months: string[];
  monthsShort: string[];
  monthsIeee: string[];
  open: string;
  close: string;
  hOpen: string;
  hClose: string;
};

const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function ordinal(n: string): string {
  const v = Number.parseInt(n, 10);
  if (!Number.isFinite(v)) return n;
  const m100 = v % 100;
  const suffix = m100 >= 11 && m100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[v % 10] ?? "th";
  return `${v}${suffix}`;
}

const EN: Terms = {
  comma: ", ",
  and: (n) => `and ${n}`,
  amp: (n) => `& ${n}`,
  etAl: "et al.",
  nd: "n.d.",
  harvardNd: "no date",
  edition: (n, style) => `${ordinal(n)} ${style === "harvard" ? "edn" : "ed."}`,
  vol: "vol.",
  no: "no.",
  pp: "pp.",
  p: "p.",
  accessed: "Accessed",
  harvardAccessed: "Accessed:",
  available: "Available at:",
  retrieved: (date, url) => `Retrieved ${date}, from ${url}`,
  months: EN_MONTHS,
  monthsShort: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."],
  monthsIeee: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
  open: "“",
  close: "”",
  hOpen: "‘",
  hClose: "’",
};

const AR: Terms = {
  comma: "، ",
  and: (n) => `و${n}`,
  amp: (n) => `و${n}`,
  etAl: "وآخرون",
  nd: "د.ت.",
  harvardNd: "د.ت.",
  edition: (n) => `ط. ${n}`,
  vol: "مج.",
  no: "ع.",
  pp: "ص ص.",
  p: "ص.",
  accessed: "تاريخ الاطلاع",
  harvardAccessed: "تاريخ الاطلاع:",
  available: "متاح على:",
  retrieved: (date, url) => `استُرجع في ${date}، من ${url}`,
  months: AR_MONTHS,
  monthsShort: AR_MONTHS,
  monthsIeee: AR_MONTHS,
  open: "“",
  close: "”",
  hOpen: "“",
  hClose: "”",
};

const termsFor = (s: CiteSource) => (sourceLang(s) === "ar" ? AR : EN);

/* ------------------------------------------------------------------ names */

const clean = (v: string | undefined) => (v ?? "").replace(/\s+/g, " ").trim();

/** "Jane Ann" → ["J.", "A."]; "Jean-Paul" → ["J.-P."]. */
function initialList(given: string): string[] {
  return clean(given)
    .split(" ")
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .filter(Boolean)
        .map((p) => `${p.replace(/\.$/, "").charAt(0).toUpperCase()}.`)
        .join("-"),
    );
}

const isOrg = (a: CiteAuthor) => !clean(a.given);
const named = (s: CiteSource) => s.authors.filter((a) => clean(a.family) || clean(a.given)).map((a) => (clean(a.family) ? a : { given: "", family: a.given }));

function invertedName(a: CiteAuthor, ar: boolean, mode: "initials" | "initialsTight" | "full"): string {
  if (isOrg(a)) return clean(a.family);
  const family = clean(a.family);
  if (ar || mode === "full") return `${family}${ar ? "، " : ", "}${clean(a.given)}`;
  const ini = initialList(a.given);
  return `${family}, ${mode === "initialsTight" ? ini.join("") : ini.join(" ")}`;
}

function directName(a: CiteAuthor, ar: boolean, initials: boolean): string {
  if (isOrg(a)) return clean(a.family);
  if (ar || !initials) return `${clean(a.given)} ${clean(a.family)}`;
  return `${initialList(a.given).join(" ")} ${clean(a.family)}`;
}

/** How many names each style lists before switching to "et al." (or APA's ellipsis). */
export type AuthorListing = {
  refListed: number;
  refEtAl: boolean;
  refEllipsis: boolean;
  inTextListed: number;
  inTextEtAl: boolean;
};

export function authorListing(style: CitationStyleId, n: number): AuthorListing {
  const count = Math.max(0, Math.floor(n));
  switch (style) {
    case "apa":
      return {
        refListed: count <= 20 ? count : 20,
        refEtAl: false,
        refEllipsis: count > 20,
        inTextListed: count <= 2 ? count : 1,
        inTextEtAl: count >= 3,
      };
    case "mla":
      return { refListed: count <= 2 ? count : 1, refEtAl: count >= 3, refEllipsis: false, inTextListed: count <= 2 ? count : 1, inTextEtAl: count >= 3 };
    case "chicago":
      return {
        refListed: count <= 10 ? count : 7,
        refEtAl: count > 10,
        refEllipsis: false,
        inTextListed: count <= 3 ? count : 1,
        inTextEtAl: count >= 4,
      };
    case "harvard":
      return { refListed: count <= 3 ? count : 1, refEtAl: count >= 4, refEllipsis: false, inTextListed: count <= 3 ? count : 1, inTextEtAl: count >= 4 };
    case "ieee":
      return { refListed: count <= 6 ? count : 1, refEtAl: count >= 7, refEllipsis: false, inTextListed: 0, inTextEtAl: false };
  }
}

/** Joins a name list with the style's separators: "A, B, & C" / "A, B and C" / "A and B". */
function joinNames(names: string[], t: Terms, opts: { amp?: boolean; serial: boolean; twoComma?: boolean }): string {
  if (names.length <= 1) return names[0] ?? "";
  const last = names[names.length - 1];
  const link = opts.amp ? t.amp(last) : t.and(last);
  const ar = t === AR;
  if (names.length === 2) {
    if (ar) return `${names[0]}${opts.twoComma ? "، " : " "}${link}`;
    return `${names[0]}${opts.twoComma ? ", " : " "}${link}`;
  }
  const head = names.slice(0, -1).join(t.comma);
  if (ar) return `${head}${t.comma}${link}`;
  return `${head}${opts.serial ? ", " : " "}${link}`;
}

function referenceAuthors(s: CiteSource, style: CitationStyleId): string {
  const t = termsFor(s);
  const ar = t === AR;
  const list = named(s);
  if (list.length === 0) return "";
  const L = authorListing(style, list.length);
  switch (style) {
    case "apa": {
      const inv = list.map((a) => invertedName(a, ar, "initials"));
      if (L.refEllipsis) return `${inv.slice(0, 19).join(t.comma)}${t.comma}. . . ${inv[inv.length - 1]}`;
      return joinNames(inv, t, { amp: true, serial: true, twoComma: true });
    }
    case "mla": {
      const first = invertedName(list[0], ar, "full");
      if (L.refEtAl) return `${first}${t.comma}${t.etAl}`;
      if (list.length === 2) return joinNames([first, directName(list[1], ar, false)], t, { serial: true, twoComma: true });
      return first;
    }
    case "chicago": {
      const names = list.slice(0, L.refListed).map((a, i) => (i === 0 ? invertedName(a, ar, "full") : directName(a, ar, false)));
      if (L.refEtAl) return `${names.join(t.comma)}${t.comma}${t.etAl}`;
      return joinNames(names, t, { serial: true, twoComma: true });
    }
    case "harvard": {
      if (L.refEtAl) return `${invertedName(list[0], ar, "initialsTight")} ${t.etAl}`;
      const inv = list.map((a) => invertedName(a, ar, "initialsTight"));
      return joinNames(inv, t, { serial: false });
    }
    case "ieee": {
      if (L.refEtAl) return `${directName(list[0], ar, true)} ${t.etAl}`;
      return joinNames(
        list.map((a) => directName(a, ar, true)),
        t,
        { serial: true },
      );
    }
  }
}

/* ------------------------------------------------------------------ fields */

/** Normalizes page ranges to an en dash: "45-67" → "45–67". */
export function normalizePages(pages: string): string {
  return clean(pages).replace(/\s*[-‐‑‒–—]+\s*/g, "–");
}

const isRange = (pages: string) => /–/.test(normalizePages(pages));

function monthIndex(s: CiteSource): number | null {
  const m = Number.parseInt(s.month, 10);
  return m >= 1 && m <= 12 ? m - 1 : null;
}

function isoDate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(clean(iso));
  if (!match) return null;
  const [, y, m, d] = match.map(Number) as unknown as [number, number, number, number];
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 ? { y, m: m - 1, d } : null;
}

function accessText(s: CiteSource, style: CitationStyleId): string {
  const t = termsFor(s);
  const a = isoDate(s.accessed);
  if (!a) return "";
  switch (style) {
    case "mla":
      return `${a.d} ${t.monthsShort[a.m]} ${a.y}`;
    case "harvard":
      return `${a.d} ${t.months[a.m]} ${a.y}`;
    case "ieee":
      return t === AR ? `${a.d} ${t.monthsIeee[a.m]} ${a.y}` : `${t.monthsIeee[a.m]} ${a.d}, ${a.y}`;
    default:
      return t === AR ? `${a.d} ${t.months[a.m]} ${a.y}` : `${t.months[a.m]} ${a.d}, ${a.y}`;
  }
}

export function doiUrl(doi: string): string {
  const d = parseDoi(doi);
  return d ? `https://doi.org/${d}` : "";
}

const stripProtocol = (url: string) => clean(url).replace(/^https?:\/\//i, "");

/* ------------------------------------------------------------------ builder */

class Builder {
  segs: CiteSegment[] = [];
  add(text: string, part: CitePart, italic = false) {
    if (text) this.segs.push({ text, part, italic });
    return this;
  }
  p(text: string) {
    return this.add(text, "punct");
  }
  /** Adds a closing period unless the text already ends with terminal punctuation. */
  end(mark = ".") {
    const last = this.segs[this.segs.length - 1];
    if (last && /[.?!]$/.test(last.text)) return this;
    return this.p(mark);
  }
  done(): CiteSegment[] {
    const out: CiteSegment[] = [];
    for (const s of this.segs) {
      const prev = out[out.length - 1];
      if (prev && prev.part === s.part && !!prev.italic === !!s.italic) prev.text += s.text;
      else out.push({ ...s });
    }
    return out;
  }
}

/** Trailing period for a field that may already end with one (initials, "et al.", "n.d."). */
const withPeriod = (text: string) => (/[.?!]$/.test(text) ? text : `${text}.`);

function apa(s: CiteSource): CiteSegment[] {
  const t = termsFor(s);
  const b = new Builder();
  const authors = referenceAuthors(s, "apa");
  const title = clean(s.title);
  const year = clean(s.year);
  const mi = monthIndex(s);
  const day = clean(s.day);
  const dateInner =
    year && s.type === "website" && mi !== null
      ? t === AR
        ? `${year}، ${day ? `${day} ` : ""}${t.months[mi]}`
        : `${year}, ${t.months[mi]}${day ? ` ${day}` : ""}`
      : year || t.nd;
  const titleItalic = s.type !== "journal";
  const doi = doiUrl(s.doi);
  const ed = clean(s.edition);

  if (authors) {
    b.add(withPeriod(authors), "author").p(" ");
    b.add(`(${dateInner})`, "date").p(". ");
    b.add(title, "title", titleItalic);
  } else {
    b.add(title, "title", titleItalic);
    if (s.type === "book" && ed) b.p(" ").add(`(${t.edition(ed, "apa")})`, "edition");
    b.end().p(" ").add(`(${dateInner})`, "date");
  }
  if (authors && s.type === "book" && ed) b.p(" ").add(`(${t.edition(ed, "apa")})`, "edition");
  b.end();

  if (s.type === "journal") {
    const container = clean(s.container);
    if (container) {
      b.p(" ").add(container, "container", true);
      if (clean(s.volume)) b.p(t.comma).add(clean(s.volume), "locator", true);
      if (clean(s.issue)) b.add(`(${clean(s.issue)})`, "locator");
      if (clean(s.pages)) b.p(t.comma).add(normalizePages(s.pages), "locator");
      b.p(".");
    }
  } else if (s.type === "book") {
    if (clean(s.publisher)) b.p(" ").add(clean(s.publisher), "publisher").p(".");
  } else if (clean(s.container) && clean(s.container) !== authors.replace(/\.$/, "")) {
    b.p(" ").add(clean(s.container), "container").p(".");
  }

  if (doi) b.p(" ").add(doi, "identifier");
  else if (clean(s.url)) {
    if (s.type === "website" && !year && accessText(s, "apa")) b.p(" ").add(t.retrieved(accessText(s, "apa"), clean(s.url)), "access");
    else b.p(" ").add(clean(s.url), "identifier");
  }
  return b.done();
}

function mla(s: CiteSource): CiteSegment[] {
  const t = termsFor(s);
  const b = new Builder();
  const authors = referenceAuthors(s, "mla");
  const title = clean(s.title);
  const year = clean(s.year);
  const mi = monthIndex(s);
  const date = year ? `${clean(s.day) && mi !== null ? `${clean(s.day)} ` : ""}${mi !== null ? `${t.monthsShort[mi]} ` : ""}${year}` : "";
  const doi = doiUrl(s.doi);
  const location = doi || stripProtocol(s.url);

  if (authors) b.add(withPeriod(authors), "author").p(" ");
  if (s.type === "book") b.add(title, "title", true).end();
  else b.add(`${t.open}${withPeriod(title)}${t.close}`, "title");

  const elements: { text: string; part: CitePart; italic?: boolean }[] = [];
  if (s.type === "journal") {
    if (clean(s.container)) elements.push({ text: clean(s.container), part: "container", italic: true });
    if (clean(s.volume)) elements.push({ text: `${t.vol} ${clean(s.volume)}`, part: "locator" });
    if (clean(s.issue)) elements.push({ text: `${t.no} ${clean(s.issue)}`, part: "locator" });
    if (date) elements.push({ text: date, part: "date" });
    if (clean(s.pages)) elements.push({ text: `${isRange(s.pages) ? t.pp : t.p} ${normalizePages(s.pages)}`, part: "locator" });
  } else if (s.type === "book") {
    if (clean(s.edition)) elements.push({ text: t.edition(clean(s.edition), "mla"), part: "edition" });
    if (clean(s.publisher)) elements.push({ text: clean(s.publisher), part: "publisher" });
    if (date) elements.push({ text: date, part: "date" });
  } else {
    if (clean(s.container)) elements.push({ text: clean(s.container), part: "container", italic: true });
    if (date) elements.push({ text: date, part: "date" });
  }
  if (location) elements.push({ text: location, part: "identifier" });

  if (elements.length) {
    b.p(" ");
    elements.forEach((e, i) => {
      if (i > 0) b.p(t.comma);
      b.add(e.text, e.part, e.italic);
    });
    b.p(".");
  }
  if (s.type === "website" && !year && accessText(s, "mla")) b.p(" ").add(`${t.accessed} ${accessText(s, "mla")}`, "access").p(".");
  return b.done();
}

function chicago(s: CiteSource): CiteSegment[] {
  const t = termsFor(s);
  const b = new Builder();
  const authors = referenceAuthors(s, "chicago");
  const title = clean(s.title);
  const year = clean(s.year) || t.nd;
  const doi = doiUrl(s.doi);
  const quoted = `${t.open}${withPeriod(title)}${t.close}`;

  if (authors) b.add(withPeriod(authors), "author").p(" ").add(withPeriod(year), "date").p(" ");
  if (s.type === "book") b.add(title, "title", true).end();
  else b.add(quoted, "title");
  if (!authors) b.p(" ").add(withPeriod(year), "date");

  if (s.type === "journal") {
    if (clean(s.container)) {
      b.p(" ").add(clean(s.container), "container", true);
      if (clean(s.volume)) b.p(" ").add(clean(s.volume), "locator");
      if (clean(s.issue)) b.p(" ").add(`(${clean(s.issue)})`, "locator");
      if (clean(s.pages)) b.p(": ").add(normalizePages(s.pages), "locator");
      b.p(".");
    }
  } else if (s.type === "book") {
    if (clean(s.edition)) b.p(" ").add(withPeriod(t.edition(clean(s.edition), "chicago")), "edition");
    const pub = [clean(s.place), clean(s.publisher)].filter(Boolean).join(": ");
    if (pub) b.p(" ").add(pub, "publisher").p(".");
  } else {
    if (clean(s.container)) b.p(" ").add(clean(s.container), "container").p(".");
    if (!clean(s.year) && accessText(s, "chicago")) b.p(" ").add(`${t.accessed} ${accessText(s, "chicago")}`, "access").p(".");
  }
  if (doi) b.p(" ").add(`${doi}.`, "identifier");
  else if (clean(s.url)) b.p(" ").add(`${clean(s.url)}.`, "identifier");
  return b.done();
}

function harvard(s: CiteSource): CiteSegment[] {
  const t = termsFor(s);
  const b = new Builder();
  const authors = referenceAuthors(s, "harvard");
  const title = clean(s.title);
  const year = clean(s.year) || t.harvardNd;
  const doi = doiUrl(s.doi);

  if (authors) b.add(authors, "author").p(" ").add(`(${year})`, "date").p(" ");
  if (s.type === "journal") b.add(`${t.hOpen}${title}${t.hClose}`, "title");
  else b.add(title, "title", true);
  if (!authors) b.p(" ").add(`(${year})`, "date");

  if (s.type === "journal") {
    if (clean(s.container)) b.p(t.comma).add(clean(s.container), "container", true);
    const vi = `${clean(s.volume)}${clean(s.issue) ? `(${clean(s.issue)})` : ""}`;
    if (vi) b.p(t.comma).add(vi, "locator");
    if (clean(s.pages)) b.p(t.comma).add(`${isRange(s.pages) ? t.pp : t.p} ${normalizePages(s.pages)}`, "locator");
    b.p(".");
  } else if (s.type === "book") {
    b.end();
    if (clean(s.edition)) b.p(" ").add(withPeriod(t.edition(clean(s.edition), "harvard")), "edition");
    const pub = [clean(s.place), clean(s.publisher)].filter(Boolean).join(": ");
    if (pub) b.p(" ").add(pub, "publisher").p(".");
  } else {
    b.end();
  }

  const link = doi || clean(s.url);
  if (link) {
    b.p(" ").add(`${t.available} ${link}`, "identifier");
    if (!doi && accessText(s, "harvard")) b.p(" ").add(`(${t.harvardAccessed} ${accessText(s, "harvard")})`, "access");
    b.p(".");
  }
  return b.done();
}

function ieee(s: CiteSource, index: number): CiteSegment[] {
  const t = termsFor(s);
  const b = new Builder();
  const authors = referenceAuthors(s, "ieee");
  const title = clean(s.title);
  const year = clean(s.year);
  const mi = monthIndex(s);
  const doi = parseDoi(s.doi);

  b.add(`[${index}]`, "number").p(" ");
  if (s.type === "website") {
    if (authors) b.add(withPeriod(authors), "author").p(" ");
    b.add(`${t.open}${withPeriod(title)}${t.close}`, "title");
    if (clean(s.container)) b.p(" ").add(withPeriod(clean(s.container)), "container");
    if (clean(s.url)) b.p(" ").add(clean(s.url), "identifier");
    if (accessText(s, "ieee")) b.p(" ").add(`(${t === AR ? t.accessed : "accessed"} ${accessText(s, "ieee")})`, "access");
    return b.end().done();
  }

  if (authors) b.add(authors, "author").p(t.comma);
  if (s.type === "journal") {
    b.add(`${t.open}${title}${t === AR ? "" : ","}${t.close}`, "title");
    if (t === AR) b.p("،");
    if (clean(s.container)) b.p(" ").add(clean(s.container), "container", true);
    const parts: { text: string; part: CitePart }[] = [];
    if (clean(s.volume)) parts.push({ text: `${t.vol} ${clean(s.volume)}`, part: "locator" });
    if (clean(s.issue)) parts.push({ text: `${t.no} ${clean(s.issue)}`, part: "locator" });
    if (clean(s.pages)) parts.push({ text: `${isRange(s.pages) ? t.pp : t.p} ${normalizePages(s.pages)}`, part: "locator" });
    if (year) parts.push({ text: `${mi !== null ? `${t.monthsIeee[mi]} ` : ""}${year}`, part: "date" });
    parts.forEach((p) => b.p(t.comma).add(p.text, p.part));
    if (doi) b.p(t.comma).add(`doi: ${doi}`, "identifier");
    return b.end().done();
  }

  // book
  b.add(title, "title", true);
  if (clean(s.edition)) b.p(t.comma).add(t.edition(clean(s.edition), "ieee"), "edition");
  b.p(". ");
  const pub = [clean(s.place), clean(s.publisher)].filter(Boolean).join(": ");
  if (pub) b.add(pub, "publisher");
  if (year) b.p(pub ? t.comma : "").add(year, "date");
  if (doi) b.p(t.comma).add(`doi: ${doi}`, "identifier");
  return b.end().done();
}

/** Reference-list entry as styled segments (italic flags + element tags for highlighting). */
export function formatReference(s: CiteSource, style: CitationStyleId, index = 1): CiteSegment[] {
  switch (style) {
    case "apa":
      return apa(s);
    case "mla":
      return mla(s);
    case "chicago":
      return chicago(s);
    case "harvard":
      return harvard(s);
    case "ieee":
      return ieee(s, index);
  }
}

export function segmentsToText(segs: CiteSegment[]): string {
  return segs.map((s) => s.text).join("");
}

const escapeHtml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function segmentsToHtml(segs: CiteSegment[]): string {
  return segs.map((s) => (s.italic ? `<i>${escapeHtml(s.text)}</i>` : escapeHtml(s.text))).join("");
}

/* ------------------------------------------------------------------ in-text */

export type InTextOptions = { page?: string; index?: number; narrative?: boolean };

function shortTitle(s: CiteSource): string {
  const t = termsFor(s);
  const words = clean(s.title).split(" ").slice(0, 4).join(" ");
  return s.type === "book" ? words : `${t.open}${words}${t.close}`;
}

function inTextNames(s: CiteSource, style: CitationStyleId, narrative: boolean): string {
  const t = termsFor(s);
  const list = named(s);
  if (list.length === 0) return shortTitle(s);
  const L = authorListing(style, list.length);
  const fam = list.map((a) => clean(a.family));
  if (L.inTextEtAl) return `${fam[0]} ${t.etAl}`;
  if (fam.length === 1) return fam[0];
  const amp = style === "apa" && !narrative;
  return joinNames(fam, t, { amp, serial: style === "chicago" || (style === "apa" && fam.length > 2) });
}

/** Parenthetical (or narrative) in-text citation, with an optional page pinpoint. */
export function formatInText(s: CiteSource, style: CitationStyleId, opts: InTextOptions = {}): string {
  const t = termsFor(s);
  const ar = t === AR;
  const page = normalizePages(opts.page ?? "");
  const pageLabel = page ? `${isRange(page) ? t.pp : t.p} ${page}` : "";
  const narrative = !!opts.narrative;
  if (style === "ieee") return `[${opts.index ?? 1}${page ? `${t.comma}${pageLabel}` : ""}]`;

  const names = inTextNames(s, style, narrative);
  const c = ar ? "، " : ", ";
  switch (style) {
    case "apa": {
      const year = clean(s.year) || t.nd;
      return narrative ? `${names} (${year}${page ? `${c}${pageLabel}` : ""})` : `(${names}${c}${year}${page ? `${c}${pageLabel}` : ""})`;
    }
    case "mla":
      return narrative ? `${names}${page ? ` (${page})` : ""}` : `(${names}${page ? ` ${page}` : ""})`;
    case "chicago": {
      const year = clean(s.year) || t.nd;
      return narrative ? `${names} (${year}${page ? `${c}${page}` : ""})` : `(${names} ${year}${page ? `${c}${page}` : ""})`;
    }
    case "harvard": {
      const year = clean(s.year) || t.harvardNd;
      return narrative ? `${names} (${year}${page ? `${c}${pageLabel}` : ""})` : `(${names}${c}${year}${page ? `${c}${pageLabel}` : ""})`;
    }
  }
}

/* ------------------------------------------------------------------ completeness */

export type CiteField = keyof Omit<CiteSource, "id" | "type">;
export type FieldCheck = { field: CiteField; level: "required" | "recommended"; filled: boolean };

const FIELD_RULES: Record<CiteSourceType, { required: CiteField[]; recommended: CiteField[] }> = {
  journal: { required: ["authors", "title", "container", "year"], recommended: ["volume", "issue", "pages", "doi"] },
  book: { required: ["authors", "title", "publisher", "year"], recommended: ["place", "edition", "isbn"] },
  website: { required: ["title", "container", "url"], recommended: ["authors", "year", "accessed"] },
};

export function checkFields(s: CiteSource): FieldCheck[] {
  const filled = (f: CiteField) => (f === "authors" ? named(s).length > 0 : f === "doi" ? !!parseDoi(s.doi) : !!clean(String(s[f])));
  const rules = FIELD_RULES[s.type];
  return [
    ...rules.required.map((field) => ({ field, level: "required" as const, filled: filled(field) })),
    ...rules.recommended.map((field) => ({ field, level: "recommended" as const, filled: filled(field) })),
  ];
}

/** Weighted completeness 0–100: required fields count double. */
export function completeness(s: CiteSource): number {
  const checks = checkFields(s);
  const total = checks.reduce((n, c) => n + (c.level === "required" ? 2 : 1), 0);
  const got = checks.reduce((n, c) => n + (c.filled ? (c.level === "required" ? 2 : 1) : 0), 0);
  return total ? Math.round((got / total) * 100) : 0;
}

/* ------------------------------------------------------------------ sorting */

const LEADING_ARTICLE = /^(the|an?|al-|ال)\s*/i;

export function sortKey(s: CiteSource): string {
  const first = named(s)[0];
  const base = first ? clean(first.family) : clean(s.title).replace(LEADING_ARTICLE, "");
  return base.replace(/^["“‘']+/, "").toLocaleLowerCase();
}

/** Alphabetical reference-list order (author family name, else title without a leading article; then year, then title). */
export function sortBibliography(list: CiteSource[]): CiteSource[] {
  return [...list].sort(
    (a, b) =>
      sortKey(a).localeCompare(sortKey(b), "en", { sensitivity: "base" }) ||
      clean(a.year).localeCompare(clean(b.year)) ||
      clean(a.title).localeCompare(clean(b.title), "en", { sensitivity: "base" }),
  );
}

/* ------------------------------------------------------------------ identifiers */

/** Extracts a DOI from "10.x/y", "doi:10.x/y" or a doi.org URL; null when none. */
export function parseDoi(input: string): string | null {
  const m = /(10\.\d{4,9}\/[^\s"<>]+)/i.exec(clean(input));
  if (!m) return null;
  return m[1].replace(/[.,;:)\]]+$/, "");
}

export type IsbnInfo = { isbn13: string; isbn10: string | null };

function isbn10Valid(d: string): boolean {
  if (!/^\d{9}[\dX]$/.test(d)) return false;
  const sum = d.split("").reduce((s, ch, i) => s + (ch === "X" ? 10 : Number(ch)) * (10 - i), 0);
  return sum % 11 === 0;
}

function isbn13Check(d12: string): number {
  const sum = d12.split("").reduce((s, ch, i) => s + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

/** Validates an ISBN-10 or ISBN-13 (hyphens/spaces allowed) and returns both forms; null if invalid. */
export function parseIsbn(input: string): IsbnInfo | null {
  const d = clean(input).replace(/^isbn(?:-1[03])?:?\s*/i, "").replace(/[\s-]/g, "").toUpperCase();
  if (d.length === 10 && isbn10Valid(d)) {
    const d12 = `978${d.slice(0, 9)}`;
    return { isbn13: `${d12}${isbn13Check(d12)}`, isbn10: d };
  }
  if (/^97[89]\d{10}$/.test(d) && isbn13Check(d.slice(0, 12)) === Number(d[12])) {
    let isbn10: string | null = null;
    if (d.startsWith("978")) {
      const body = d.slice(3, 12);
      const sum = body.split("").reduce((s, ch, i) => s + Number(ch) * (10 - i), 0);
      const check = (11 - (sum % 11)) % 11;
      isbn10 = `${body}${check === 10 ? "X" : check}`;
    }
    return { isbn13: d, isbn10 };
  }
  return null;
}

export type DetectedIdentifier = { kind: "doi"; value: string } | { kind: "isbn"; value: IsbnInfo } | null;

export function detectIdentifier(input: string): DetectedIdentifier {
  const doi = parseDoi(input);
  if (doi) return { kind: "doi", value: doi };
  const isbn = parseIsbn(input);
  return isbn ? { kind: "isbn", value: isbn } : null;
}

/* ------------------------------------------------------------------ metadata mapping */

/** Splits "Jane A. Doe" or "Doe, Jane A." into given / family. A single word is an organization-style family name. */
export function splitName(full: string): CiteAuthor {
  const name = clean(full);
  if (name.includes(",")) {
    const [family, ...rest] = name.split(",");
    return { family: clean(family), given: clean(rest.join(" ")) };
  }
  const parts = name.split(" ");
  if (parts.length === 1) return { given: "", family: name };
  return { family: parts[parts.length - 1], given: parts.slice(0, -1).join(" ") };
}

type CrossrefDate = { "date-parts"?: (number | null)[][] };
type CrossrefWork = {
  type?: string;
  title?: string[];
  subtitle?: string[];
  author?: { given?: string; family?: string; name?: string }[];
  editor?: { given?: string; family?: string; name?: string }[];
  "container-title"?: string[];
  publisher?: string;
  "publisher-location"?: string;
  issued?: CrossrefDate;
  "published-print"?: CrossrefDate;
  "published-online"?: CrossrefDate;
  published?: CrossrefDate;
  volume?: string;
  issue?: string;
  page?: string;
  "edition-number"?: string;
  DOI?: string;
  ISBN?: string[];
  URL?: string;
};

const BOOK_TYPES = new Set(["book", "monograph", "edited-book", "reference-book", "book-set"]);

/** Crossref /works/{doi} `message` → source fields (journal articles and books; anything else maps to a journal-style entry). */
export function sourceFromCrossref(work: unknown, id: string): CiteSource {
  const w = (work ?? {}) as CrossrefWork;
  const s = emptySource(id, BOOK_TYPES.has(w.type ?? "") ? "book" : "journal");
  const people = (w.author?.length ? w.author : w.editor) ?? [];
  const authors = people
    .map((a) => (a.family ? { given: clean(a.given), family: clean(a.family) } : a.name ? { given: "", family: clean(a.name) } : null))
    .filter((a): a is CiteAuthor => !!a);
  if (authors.length) s.authors = authors;
  const title = clean(w.title?.[0]);
  const sub = clean(w.subtitle?.[0]);
  s.title = sub ? `${title}: ${sub}` : title;
  s.container = s.type === "journal" ? clean(w["container-title"]?.[0]) : "";
  s.publisher = clean(w.publisher);
  s.place = clean(w["publisher-location"]);
  const dp = (w["published-print"] ?? w.published ?? w["published-online"] ?? w.issued)?.["date-parts"]?.[0] ?? [];
  if (dp[0]) s.year = String(dp[0]);
  if (dp[1]) s.month = String(dp[1]);
  if (dp[2]) s.day = String(dp[2]);
  s.volume = clean(w.volume);
  s.issue = clean(w.issue);
  s.pages = w.page ? normalizePages(w.page) : "";
  s.edition = clean(w["edition-number"]);
  s.doi = clean(w.DOI);
  s.isbn = clean(w.ISBN?.[0]);
  return s;
}

type OpenLibraryBook = {
  title?: string;
  subtitle?: string;
  authors?: { name?: string }[];
  publishers?: { name?: string }[];
  publish_places?: { name?: string }[];
  publish_date?: string;
  identifiers?: { doi?: string[] };
};

/** Open Library /api/books?jscmd=data entry → book source. */
export function sourceFromOpenLibrary(book: unknown, isbn: string, id: string): CiteSource {
  const b = (book ?? {}) as OpenLibraryBook;
  const s = emptySource(id, "book");
  const authors = (b.authors ?? []).map((a) => clean(a.name)).filter(Boolean).map(splitName);
  if (authors.length) s.authors = authors;
  s.title = clean(b.subtitle) ? `${clean(b.title)}: ${clean(b.subtitle)}` : clean(b.title);
  s.publisher = clean(b.publishers?.[0]?.name);
  s.place = clean(b.publish_places?.[0]?.name);
  s.year = /(\d{4})/.exec(b.publish_date ?? "")?.[1] ?? "";
  s.isbn = isbn;
  s.doi = clean(b.identifiers?.doi?.[0]);
  return s;
}

/* ------------------------------------------------------------------ export */

const bibEscape = (v: string) => v.replace(/([{}&%$#_])/g, "\\$1");

export function bibtexKey(s: CiteSource): string {
  const first = named(s)[0];
  const who = (first ? clean(first.family) : "anon").toLowerCase().replace(/[^a-z0-9]/g, "") || "ref";
  const word = clean(s.title).replace(LEADING_ARTICLE, "").split(" ")[0]?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  return `${who}${clean(s.year) || "nd"}${word}`;
}

export function toBibtex(list: CiteSource[]): string {
  const used = new Map<string, number>();
  return list
    .filter((s) => clean(s.title))
    .map((s) => {
      let key = bibtexKey(s);
      const n = used.get(key) ?? 0;
      used.set(key, n + 1);
      if (n > 0) key += String.fromCharCode(97 + n);
      const kind = s.type === "journal" ? "article" : s.type === "book" ? "book" : "misc";
      const authors = named(s)
        .map((a) => (isOrg(a) ? `{${bibEscape(clean(a.family))}}` : `${bibEscape(clean(a.family))}, ${bibEscape(clean(a.given))}`))
        .join(" and ");
      const fields: [string, string][] = [
        ["author", authors],
        ["title", `{${bibEscape(clean(s.title))}}`],
        [s.type === "journal" ? "journal" : "howpublished", s.type === "book" ? "" : bibEscape(clean(s.container))],
        ["publisher", bibEscape(clean(s.publisher))],
        ["address", bibEscape(clean(s.place))],
        ["edition", bibEscape(clean(s.edition))],
        ["year", clean(s.year)],
        ["month", clean(s.month)],
        ["volume", clean(s.volume)],
        ["number", clean(s.issue)],
        ["pages", normalizePages(s.pages).replace("–", "--")],
        ["doi", parseDoi(s.doi) ?? ""],
        ["isbn", clean(s.isbn)],
        ["url", clean(s.url)],
        ["urldate", isoDate(s.accessed) ? clean(s.accessed) : ""],
      ];
      const body = fields
        .filter(([, v]) => v)
        .map(([k, v]) => `  ${k} = {${v}}`)
        .join(",\n");
      return `@${kind}{${key},\n${body}\n}`;
    })
    .join("\n\n")
    .concat("\n");
}

/** RIS (Research Information Systems) export; CRLF line endings per the RIS specification. */
export function toRis(list: CiteSource[]): string {
  const lines: string[] = [];
  const tag = (k: string, v: string) => {
    if (clean(v)) lines.push(`${k}  - ${clean(v)}`);
  };
  list
    .filter((s) => clean(s.title))
    .forEach((s) => {
      tag("TY", s.type === "journal" ? "JOUR" : s.type === "book" ? "BOOK" : "ELEC");
      named(s).forEach((a) => tag("AU", isOrg(a) ? clean(a.family) : `${clean(a.family)}, ${clean(a.given)}`));
      tag("TI", s.title);
      if (s.type === "journal") tag("T2", s.container);
      else if (s.type === "website") tag("T2", s.container);
      tag("PY", s.year);
      if (clean(s.year)) {
        const mm = clean(s.month).padStart(2, "0");
        const dd = clean(s.day).padStart(2, "0");
        tag("DA", `${clean(s.year)}/${clean(s.month) ? mm : ""}/${clean(s.day) ? dd : ""}/`);
      }
      tag("VL", s.volume);
      tag("IS", s.issue);
      const [sp, ep] = normalizePages(s.pages).split("–");
      tag("SP", sp ?? "");
      tag("EP", ep ?? "");
      tag("ET", s.edition);
      tag("PB", s.publisher);
      tag("CY", s.place);
      tag("SN", s.isbn);
      tag("DO", parseDoi(s.doi) ?? "");
      tag("UR", s.url);
      if (isoDate(s.accessed)) tag("Y2", clean(s.accessed).replace(/-/g, "/"));
      tag("LA", sourceLang(s) === "ar" ? "ara" : "eng");
      lines.push("ER  - ");
    });
  return lines.join("\r\n") + "\r\n";
}
