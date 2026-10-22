"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import DuplicateLineShareExportModal from "./DuplicateLineShareExportModal";
import { useDlModel } from "./DlLiveContext";

/**
 * Result card: lines in → unique lines out as the hero with a kept/removed bar, then every input line
 * in order marked kept or removed (with the line number it repeats), and the cleaned list to copy.
 */
export default function DuplicateLineResult() {
  const t = useTranslations("tools.duplicate-line-remover");
  const tr = useTranslations("tools.duplicate-line-remover.result");
  const { out, a, f, pct } = useDlModel();

  if (!out || !a) {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.placeholder")}</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        <div className="flex items-center gap-2">
          <CopyButton text={out.result} />
          <DuplicateLineShareExportModal
            operationLabel=""
            inputRows={[]}
            resultRows={[
              { label: t("aboveFold.totalLines"), value: f(out.totalLines) },
              { label: t("aboveFold.uniqueLines"), value: f(out.uniqueLines) },
              { label: t("aboveFold.removedCount"), value: f(out.removedCount) },
            ]}
            heroLabel={t("aboveFold.uniqueLines")}
            heroValue={f(out.uniqueLines)}
            sentence={`${t("aboveFold.totalLines")}: ${f(out.totalLines)} → ${t("aboveFold.uniqueLines")}: ${f(out.uniqueLines)} (${t("aboveFold.removedCount")}: ${f(out.removedCount)})`}
          />
        </div>
      }
    >
      <p dir="ltr" className="text-center font-mono text-3xl font-bold text-blue-700 dark:text-blue-400">
        {f(out.totalLines)} → {f(out.uniqueLines)}
      </p>
      <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {tr("summary", { removed: f(out.removedCount), share: pct(out.removedCount, out.totalLines), blank: f(a.blankLines) })}
      </p>
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
        <div className="bg-emerald-500" style={{ width: pct(out.uniqueLines, out.totalLines) }} />
        <div className="bg-rose-400" style={{ width: pct(out.removedCount, out.totalLines) }} />
      </div>

      <ol data-preview="visual" className="mt-4 grid max-h-96 auto-rows-fr gap-1 overflow-auto rounded-xl bg-zinc-50 p-2 lg:max-h-none lg:min-h-0 lg:flex-1 lg:basis-0 dark:bg-zinc-800/50">
        {a.lines.map((l) => (
          <li key={l.position} className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm ${l.kept ? "bg-white dark:bg-zinc-900" : "bg-rose-50 dark:bg-rose-500/10"}`}>
            <span className="w-6 shrink-0 text-end font-mono text-[11px] text-zinc-400">{l.position}</span>
            <span dir="auto" className={`min-w-0 flex-1 truncate font-mono ${l.kept ? "text-zinc-800 dark:text-zinc-100" : "text-rose-600 line-through dark:text-rose-300"}`}>
              {l.raw}
            </span>
            {!l.kept && <span className="shrink-0 text-[11px] text-rose-600 dark:text-rose-300">{tr("repeats", { n: l.firstPosition })}</span>}
            {l.kept && l.occurrences > 1 && (
              <span className="shrink-0 rounded bg-amber-100 px-1.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">×{l.occurrences}</span>
            )}
          </li>
        ))}
      </ol>

      <textarea
        readOnly
        value={out.result}
        rows={5}
        dir="auto"
        className="mt-3 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />
    </SectionCard>
  );
}
