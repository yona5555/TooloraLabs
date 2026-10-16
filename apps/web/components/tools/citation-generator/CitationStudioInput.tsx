"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { CITE_SOURCE_TYPES, detectIdentifier, emptySource, type CiteField, type CiteSource, type CiteSourceType } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { lookupIdentifier, newId, selectedIndex, selectedSource, type LookupError, type StudioState } from "./studio";

type Props = { state: StudioState; onChange: (next: StudioState) => void; onReset: () => void };

const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
const label = "mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";

/** Fields shown for each source type, in entry order (authors are edited separately). */
const TYPE_FIELDS: Record<CiteSourceType, { f: CiteField; span?: 1 | 2; numeric?: boolean; date?: boolean }[]> = {
  journal: [
    { f: "title", span: 2 },
    { f: "container", span: 2 },
    { f: "year", numeric: true },
    { f: "month", numeric: true },
    { f: "volume", numeric: true },
    { f: "issue", numeric: true },
    { f: "pages", span: 2 },
    { f: "doi", span: 2 },
    { f: "url", span: 2 },
  ],
  book: [
    { f: "title", span: 2 },
    { f: "publisher", span: 2 },
    { f: "place" },
    { f: "year", numeric: true },
    { f: "edition", numeric: true },
    { f: "isbn" },
    { f: "doi", span: 2 },
  ],
  website: [
    { f: "title", span: 2 },
    { f: "container", span: 2 },
    { f: "year", numeric: true },
    { f: "month", numeric: true },
    { f: "day", numeric: true },
    { f: "accessed", date: true },
    { f: "url", span: 2 },
  ],
};

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; error: LookupError } | { kind: "added"; title: string };

export default function CitationStudioInput({ state, onChange, onReset }: Props) {
  const t = useTranslations("tools.citation-generator.studio");
  const source = selectedSource(state);
  const index = selectedIndex(state);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const update = (patch: Partial<CiteSource>) =>
    onChange({ ...state, list: state.list.map((s) => (s.id === source.id ? { ...s, ...patch } : s)) });
  const setAuthor = (i: number, patch: Partial<CiteSource["authors"][number]>) =>
    update({ authors: source.authors.map((a, j) => (j === i ? { ...a, ...patch } : a)) });
  const addSource = (s: CiteSource) => onChange({ ...state, list: [...state.list, s], selectedId: s.id });

  async function runLookup() {
    const id = detectIdentifier(query);
    if (!id) {
      setStatus({ kind: "error", error: "invalid" });
      return;
    }
    setStatus({ kind: "loading" });
    const result = await lookupIdentifier(id);
    if (typeof result === "string") {
      setStatus({ kind: "error", error: result });
      return;
    }
    addSource(result);
    setQuery("");
    setStatus({ kind: "added", title: result.title });
  }

  const containerLabel = source.type === "website" ? t("fields.site") : t("fields.container");

  return (
    <SectionCard title={t("input.title")} bodyClassName="p-4 space-y-4">
      <div>
        <span className={label}>{t("input.lookup")}</span>
        <form
          className="flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            void runLookup();
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("input.lookupPlaceholder")}
            aria-label={t("input.lookup")}
            dir="ltr"
            className={field}
          />
          <button
            type="submit"
            disabled={status.kind === "loading" || !query.trim()}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {status.kind === "loading" ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            {t("input.fetch")}
          </button>
        </form>
        <p
          role="status"
          className={`mt-1 min-h-4 text-[11px] leading-4 ${status.kind === "error" ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"}`}
        >
          {status.kind === "loading"
            ? t("input.status.loading")
            : status.kind === "error"
              ? t(`input.status.${status.error}`)
              : status.kind === "added"
                ? t("input.status.added", { title: status.title.slice(0, 60) })
                : t("input.lookupNote")}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{t("input.editing", { n: index + 1, total: state.list.length })}</p>
        <button
          type="button"
          onClick={() => addSource(emptySource(newId(), source.type))}
          className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          <Plus size={14} />
          {t("input.newSource")}
        </button>
      </div>

      <div role="radiogroup" aria-label={t("input.type")} className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" data-bp-inner>
        {CITE_SOURCE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={source.type === type}
            onClick={() => update({ type })}
            className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${
              source.type === type ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t(`types.${type}`)}
          </button>
        ))}
      </div>

      <fieldset className="rounded-xl border border-zinc-200 p-2.5 dark:border-zinc-700">
        <legend className="px-1 text-sm font-bold text-blue-700 dark:text-blue-300">{t("fields.authors")}</legend>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1.75rem] gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          <span>{t("input.given")}</span>
          <span>{t("input.family")}</span>
          <span />
        </div>
        <div className="mt-1 space-y-1.5">
          {source.authors.map((a, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1.75rem] items-center gap-1.5">
              <input dir="auto" value={a.given} onChange={(e) => setAuthor(i, { given: e.target.value })} aria-label={t("input.given")} className={field} />
              <input dir="auto" value={a.family} onChange={(e) => setAuthor(i, { family: e.target.value })} aria-label={t("input.family")} className={field} />
              <button
                type="button"
                onClick={() => update({ authors: source.authors.length > 1 ? source.authors.filter((_, j) => j !== i) : [{ given: "", family: "" }] })}
                aria-label={t("input.removeAuthor")}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update({ authors: [...source.authors, { given: "", family: "" }] })}
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          <Plus size={14} />
          {t("input.addAuthor")}
        </button>
        <p className="mt-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("input.orgHint")}</p>
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        {TYPE_FIELDS[source.type].map(({ f, span, numeric, date }) => (
          <label key={f} className={`block ${span === 2 ? "col-span-2" : ""}`}>
            <span className={label}>{f === "container" ? containerLabel : t(`fields.${f}`)}</span>
            <input
              type={date ? "date" : "text"}
              inputMode={numeric ? "numeric" : undefined}
              dir={numeric || date || f === "doi" || f === "url" || f === "isbn" ? "ltr" : "auto"}
              value={String(source[f])}
              onChange={(e) => update({ [f]: e.target.value } as Partial<CiteSource>)}
              className={field}
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={15} />
        {t("input.reset")}
      </button>
      <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("input.savedNote")}</p>
    </SectionCard>
  );
}
