"use client";
import { useMemo } from "react";
import { analyzeJSON, JSONFormatter, type JSONAnalysis, type JSONFormatterMode, type JSONFormatterOutput, type JSONIndent, type JSONValueKind } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";

export type JSONDraft = {
  json: string;
  mode: JSONFormatterMode;
  indent: JSONIndent;
  sortKeys: boolean;
};

/** A small real-world catalogue: nested objects, an array of records, every value kind, four levels deep. */
export const SAMPLE_JSON = `{
  "library": "House of Wisdom Reading Room",
  "open": true,
  "rating": 4.6,
  "books": [
    { "id": 101, "title": "Kitab al-Jabr", "author": "Al-Khwarizmi", "year": 820, "tags": ["algebra", "classic"] },
    { "id": 102, "title": "Elements", "author": "Euclid", "year": -300, "tags": ["geometry"] },
    { "id": 103, "title": "Book of Optics", "author": "Ibn al-Haytham", "year": 1021, "tags": ["optics", "physics"] }
  ],
  "address": { "city": "Baghdad", "geo": { "lat": 33.3152, "lng": 44.3661 } },
  "manager": null
}`;

/** Quick examples: real public formats (GitHub's documented octocat user, the RFC 7946 GeoJSON Feature) plus one broken input. */
export const JSON_EXAMPLES: { id: string; json: string }[] = [
  { id: "library", json: SAMPLE_JSON },
  {
    id: "api",
    json: '{"login":"octocat","id":583231,"name":"The Octocat","public_repos":8,"site_admin":false,"plan":{"name":"free","collaborators":0},"created_at":"2011-01-25T18:44:36Z"}',
  },
  {
    id: "config",
    json: '{"name":"my-app","version":"1.0.0","private":true,"scripts":{"dev":"next dev","build":"next build","lint":"eslint ."},"dependencies":{"next":"16.3.8","react":"19.2.0"}}',
  },
  {
    id: "geojson",
    json: '{"type":"Feature","geometry":{"type":"Point","coordinates":[102.0,0.5]},"properties":{"prop0":"value0"}}',
  },
  { id: "broken", json: '{\n  "name": "Alice",\n  "age": 30,\n}' },
];

export const JSON_DEFAULTS: JSONDraft = {
  json: SAMPLE_JSON,
  mode: "format",
  indent: 2,
  sortKeys: false,
};

export const { LiveProvider: JSONLiveProvider, useLiveState: useJSONLive } = createLiveToolState<JSONDraft>();

const tool = new JSONFormatter();

export type JSONModel = {
  draft: JSONDraft;
  /** null when the input is empty. */
  output: JSONFormatterOutput | null;
  parsed: unknown;
  /** Full structural analysis; null when the input is empty or invalid. */
  a: JSONAnalysis | null;
  f: (v: number, max?: number) => string;
  pct: (part: number, whole: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function buildJSONModel(d: JSONDraft): JSONModel {
  const base = {
    draft: d,
    f: nf,
    pct: (p: number, w: number) => `${nf(w ? (p / w) * 100 : 0, 1)}%`,
  };
  if (!d.json.trim()) return { ...base, output: null, parsed: null, a: null };
  const output = tool.execute(d, { locale: "en-US" }).data;
  if (output.errorMessage) return { ...base, output, parsed: null, a: null };
  const parsed = JSON.parse(d.json);
  return { ...base, output, parsed, a: analyzeJSON(parsed, d.json) };
}

/** The live draft and its analysis, shared by the Result card and every indicator. */
export function useJSONModel(): JSONModel {
  const { dims } = useJSONLive();
  return useMemo(() => buildJSONModel(dims), [dims]);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toLocaleString("en-US", { maximumFractionDigits: 1 })} KB`;
}

/** One distinct hue per value kind, used by every indicator so a kind reads the same everywhere. */
export const KIND_FILL: Record<JSONValueKind, string> = {
  object: "fill-blue-600 dark:fill-blue-400",
  array: "fill-violet-500 dark:fill-violet-400",
  string: "fill-emerald-500 dark:fill-emerald-400",
  number: "fill-amber-500 dark:fill-amber-400",
  boolean: "fill-rose-500 dark:fill-rose-400",
  null: "fill-zinc-400 dark:fill-zinc-500",
};

export const KIND_TEXT: Record<JSONValueKind, string> = {
  object: "text-blue-700 dark:text-blue-300",
  array: "text-violet-600 dark:text-violet-300",
  string: "text-emerald-700 dark:text-emerald-300",
  number: "text-amber-700 dark:text-amber-300",
  boolean: "text-rose-600 dark:text-rose-300",
  null: "text-zinc-500 dark:text-zinc-400",
};
