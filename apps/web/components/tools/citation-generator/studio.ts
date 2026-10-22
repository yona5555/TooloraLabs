"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CITATION_STYLES,
  emptySource,
  sourceFromCrossref,
  sourceFromOpenLibrary,
  type CitationStyleId,
  type CiteSource,
  type DetectedIdentifier,
} from "@tooloralabs/tools";

export type StudioState = {
  v: 1;
  style: CitationStyleId;
  selectedId: string;
  /** Bibliography in citation order (IEEE numbers follow this order). */
  list: CiteSource[];
  /** Page pinpoint for the in-text citation. */
  page: string;
};

const STORAGE_KEY = "tooloralabs:citation-studio:v1";

let idCounter = 0;
export const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

/**
 * Realistic sample bibliography of real, verifiable sources: a Nature article (DOI), a book
 * (ISBN), a corporate web page without a date, and an Arabic book (right-to-left names).
 */
export function sampleState(): StudioState {
  const list: CiteSource[] = [
    {
      ...emptySource("sample-1", "journal"),
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
      pages: "436–444",
      doi: "10.1038/nature14539",
    },
    {
      ...emptySource("sample-2", "book"),
      authors: [{ given: "Daniel", family: "Kahneman" }],
      title: "Thinking, fast and slow",
      publisher: "Farrar, Straus and Giroux",
      place: "New York",
      year: "2011",
      isbn: "9780374275631",
    },
    {
      ...emptySource("sample-3", "website"),
      authors: [{ given: "", family: "American Psychological Association" }],
      title: "Reference examples",
      container: "APA Style",
      url: "https://apastyle.apa.org/style-grammar-guidelines/references/examples",
      accessed: "2026-10-16",
    },
    {
      ...emptySource("sample-4", "book"),
      authors: [{ given: "نجيب", family: "محفوظ" }],
      title: "بين القصرين",
      publisher: "مكتبة مصر",
      place: "القاهرة",
      year: "1956",
    },
  ];
  return { v: 1, style: "apa", selectedId: list[0].id, list, page: "437" };
}

export function selectedSource(state: StudioState): CiteSource {
  return state.list.find((s) => s.id === state.selectedId) ?? state.list[0] ?? emptySource("none");
}

export function selectedIndex(state: StudioState): number {
  return Math.max(0, state.list.findIndex((s) => s.id === state.selectedId));
}

function isValidState(x: unknown): x is StudioState {
  if (!x || typeof x !== "object") return false;
  const s = x as StudioState;
  return s.v === 1 && CITATION_STYLES.includes(s.style) && Array.isArray(s.list) && s.list.every((i) => i && Array.isArray(i.authors));
}

/** Studio state remembered per visitor (localStorage in try/catch; the page works without it). */
export function useStudioState() {
  const [state, setState] = useState<StudioState>(sampleState);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of the visitor's saved state
        if (isValidState(parsed) && parsed.list.length > 0) setState(parsed);
      }
    } catch {
      /* storage unavailable: keep the sample */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable or full */
    }
  }, [state]);

  return [state, setState] as const;
}

export function useSelected(state: StudioState) {
  return useMemo(() => ({ source: selectedSource(state), index: selectedIndex(state) }), [state]);
}

export type LookupError = "invalid" | "notFound" | "network";

/**
 * Fetches metadata from the free, keyless public APIs: Crossref REST API for DOIs and the
 * Open Library Books API for ISBNs. Both send CORS headers, so the browser calls them directly.
 */
export async function lookupIdentifier(id: DetectedIdentifier): Promise<CiteSource | LookupError> {
  if (!id) return "invalid";
  try {
    if (id.kind === "doi") {
      const path = id.value.split("/").map(encodeURIComponent).join("/");
      const res = await fetch(`https://api.crossref.org/works/${path}`, { headers: { Accept: "application/json" } });
      if (res.status === 404) return "notFound";
      if (!res.ok) return "network";
      const json = (await res.json()) as { message?: unknown };
      return json.message ? sourceFromCrossref(json.message, newId()) : "notFound";
    }
    for (const isbn of [id.value.isbn13, id.value.isbn10].filter((v): v is string => !!v)) {
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      if (!res.ok) return "network";
      const json = (await res.json()) as Record<string, unknown>;
      const book = json[`ISBN:${isbn}`];
      if (book) return sourceFromOpenLibrary(book, id.value.isbn13, newId());
    }
    return "notFound";
  } catch {
    return "network";
  }
}

/** Element colors shared by the anatomy, the style matrix and the result highlights. */
export const PART_COLORS: Record<string, string> = {
  author: "#2563eb",
  date: "#f59e0b",
  title: "#10b981",
  container: "#8b5cf6",
  edition: "#ec4899",
  publisher: "#0ea5e9",
  locator: "#f97316",
  identifier: "#64748b",
  access: "#14b8a6",
  number: "#ef4444",
};

export const PART_ORDER = ["number", "author", "date", "title", "edition", "container", "publisher", "locator", "identifier", "access"] as const;
