"use client";
import { useTranslations } from "next-intl";
import ResultActionButton from "@/components/tool-ui/ResultActionButton";
import { ArrowDownAZ, Download, Pencil, Trash2 } from "lucide-react";
import { formatReference, segmentsToHtml, segmentsToText, sortBibliography, sourceLang, toBibtex, toRis } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { downloadTextFile } from "@/lib/export";
import { CopyButton, EntryText } from "./CitationShared";
import type { StudioState } from "./studio";

type Props = { state: StudioState; onChange: (next: StudioState) => void };

const btn =
  "flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800";

/** The visitor's reference list in the selected style: edit, delete, sort A–Z, copy all, BibTeX / RIS export. */
export default function CitationBibliography({ state, onChange }: Props) {
  const t = useTranslations("tools.citation-generator.studio");
  const usable = state.list.filter((s) => s.title.trim());
  const entries = state.list.map((s, i) => ({ s, segs: formatReference(s, state.style, i + 1) }));
  const shown = entries.filter((e) => e.s.title.trim());
  const allText = shown.map((e) => segmentsToText(e.segs)).join("\n\n");
  const allHtml = shown.map((e) => `<p>${segmentsToHtml(e.segs)}</p>`).join("");

  const remove = (id: string) => {
    const list = state.list.filter((s) => s.id !== id);
    if (list.length === 0) return;
    onChange({ ...state, list, selectedId: state.selectedId === id ? list[0].id : state.selectedId });
  };
  const edit = (id: string) => {
    onChange({ ...state, selectedId: id });
    document.getElementById("tool")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SectionCard phoneRole="output" id="bibliography" title={t("bib.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("bib.intro")}</p>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
          {t(`styles.${state.style}`)} · {t("bib.count", { n: usable.length })}
        </span>
        <button type="button" className={btn} onClick={() => onChange({ ...state, list: sortBibliography(state.list) })}>
          <ArrowDownAZ size={14} />
          {t("bib.sort")}
        </button>
        <CopyButton text={allText} html={allHtml} label={t("bib.copyAll")} doneLabel={t("result.copied")} />
        <ResultActionButton action="download" type="button" className={btn} disabled={!usable.length} onClick={() => downloadTextFile("references.bib", toBibtex(usable), "application/x-bibtex;charset=utf-8")}>
          <Download size={14} />
          {t("bib.bibtex")}
        </ResultActionButton>
        <ResultActionButton action="download" type="button" className={btn} disabled={!usable.length} onClick={() => downloadTextFile("references.ris", toRis(usable), "application/x-research-info-systems;charset=utf-8")}>
          <Download size={14} />
          {t("bib.ris")}
        </ResultActionButton>
      </div>

      <ol className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
        {entries.map(({ s, segs }, i) => {
          const on = s.id === state.selectedId;
          const rtl = sourceLang(s) === "ar";
          return (
            <li key={s.id} className={`flex items-start gap-3 px-3 py-2.5 ${on ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}>
              <span className="mt-0.5 w-6 shrink-0 text-center font-mono text-xs font-bold text-zinc-400">{i + 1}</span>
              <div className="min-w-0 flex-1">
                {s.title.trim() ? (
                  <EntryText segs={segs} rtl={rtl} className="ps-6 -indent-6 font-serif text-[15px] leading-6 text-zinc-900 dark:text-zinc-50" />
                ) : (
                  <p className="text-sm text-zinc-400 italic">{t("bib.untitled")}</p>
                )}
                <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-semibold">
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{t(`types.${s.type}`)}</span>
                  {rtl && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">{t("bib.arabic")}</span>}
                  {on && <span className="rounded bg-blue-600 px-1.5 py-0.5 text-white">{t("bib.editing")}</span>}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <CopyButton text={segmentsToText(segs)} html={segmentsToHtml(segs)} label={t("result.copy")} doneLabel={t("result.copied")} compact />
                <button type="button" onClick={() => edit(s.id)} aria-label={t("bib.edit")} className="rounded-md border border-zinc-300 p-1 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  disabled={state.list.length < 2}
                  aria-label={t("bib.delete")}
                  className="rounded-md border border-zinc-300 p-1 text-zinc-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("bib.ieeeNote")}</p>
    </SectionCard>
  );
}
