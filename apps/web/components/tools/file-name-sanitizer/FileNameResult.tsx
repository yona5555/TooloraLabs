"use client";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import FileNameShareExportModal from "./FileNameShareExportModal";
import { CLASS_BG, useFnModel } from "./FnLiveContext";

/**
 * Result card: the safe name as the hero, then the original name character by character — each chip
 * coloured by its kind, illegal ones struck through — the changes applied, and whether the original and
 * the result are accepted on Windows, macOS, Linux and in a URL.
 */
export default function FileNameResult() {
  const t = useTranslations("tools.file-name-sanitizer");
  const tr = useTranslations("tools.file-name-sanitizer.result");
  const tp = useTranslations("tools.file-name-sanitizer.education.lab.platforms");
  const { draft, result, changes, error, a } = useFnModel();

  if (error || !a) {
    return (
      <SectionCard title={t("aboveFold.resultTitle")}>
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {t(`errors.${error || "required"}`)}
        </p>
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
          <CopyButton text={result} />
          <FileNameShareExportModal
            operationLabel=""
            inputRows={[{ label: t("form.inputLabel"), value: draft.fileName }]}
            resultRows={[{ label: t("aboveFold.resultTitle"), value: result }]}
            heroLabel={t("aboveFold.resultTitle")}
            heroValue={result}
            sentence={`${draft.fileName} → ${result}`}
          />
        </div>
      }
    >
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <code dir="auto" className="block text-center font-mono text-lg font-semibold break-all text-zinc-900 dark:text-zinc-100">
          {result}
        </code>
      </div>

      <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{tr("original")}</p>
      <div dir="ltr" data-preview="visual" className="flex flex-wrap content-start gap-1 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
        {a.chars.map((c, i) => (
          <span
            key={i}
            title={`U+${c.code.toString(16).toUpperCase().padStart(4, "0")}`}
            className={`flex h-9 min-w-7 items-center justify-center rounded-md px-1.5 font-mono text-sm font-bold text-white ${CLASS_BG[c.cls]} ${c.cls === "illegal" ? "line-through decoration-2" : ""}`}
          >
            {c.cls === "space" ? "␣" : c.ch}
          </span>
        ))}
      </div>

      {changes.length > 0 ? (
        <ul className="mt-4 space-y-1.5">
          {changes.map((code) => (
            <li key={code} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <Check size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              {t(`aboveFold.changeLabels.${code}`)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.noChanges")}</p>
      )}

      <div className="mt-4 grid auto-rows-fr grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-1.5 rounded-xl bg-zinc-50 p-3 text-sm lg:flex-1 dark:bg-zinc-800/50">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" />
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{tr("before")}</span>
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{tr("after")}</span>
        {a.original.map((p, i) => (
          <div key={p.platform} className="contents">
            <span className="text-zinc-700 dark:text-zinc-200">{tp(p.platform)}</span>
            <span className="justify-self-center">{p.ok ? <Check size={16} className="text-emerald-600 dark:text-emerald-400" /> : <X size={16} className="text-rose-500" />}</span>
            <span className="justify-self-center">{a.sanitized[i].ok ? <Check size={16} className="text-emerald-600 dark:text-emerald-400" /> : <X size={16} className="text-rose-500" />}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
