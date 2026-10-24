"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import DownloadButton from "@/components/tool-ui/DownloadButton";
import JSONShareExportModal from "./JSONShareExportModal";
import JSONCodeView from "./JSONCodeView";
import { formatBytes, useJSONModel } from "./JSONLiveContext";

/** Lines shown around a syntax error so the faulty line sits in its context. */
const ERROR_CONTEXT = 3;

/**
 * Result card: validity and size as the hero, then the live output itself as the indicator — syntax
 * coloured, line numbered, one rail per nesting level. An invalid input shows the faulty line in context
 * with a caret under the exact column instead.
 */
export default function JSONResult() {
  const t = useTranslations("tools.json-formatter");
  const { draft, output, a, f } = useJSONModel();

  if (!output) {
    return (
      <SectionCard phoneRole="output" title={t("aboveFold.resultTitle")}>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.placeholder")}</p>
      </SectionCard>
    );
  }

  if (output.errorMessage || !a || !output.stats) {
    const lines = draft.json.split("\n");
    const from = Math.max(0, output.errorLine - 1 - ERROR_CONTEXT);
    const shown = lines.slice(from, output.errorLine + ERROR_CONTEXT);
    return (
      <SectionCard phoneRole="output" title={t("aboveFold.resultTitle")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              {t("aboveFold.errorAt", {
                line: output.errorLine,
                column: output.errorColumn,
              })}
            </p>
            <p className="mt-1">{output.errorMessage}</p>
          </div>
        </div>
        <div
          dir="ltr"
          data-preview="visual"
          className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 py-2 font-mono text-[13px] leading-6 lg:flex-1 dark:border-zinc-700 dark:bg-zinc-800/60"
        >
          {shown.map((line, i) => {
            const n = from + i + 1;
            const bad = n === output.errorLine;
            return (
              <div key={n}>
                <div className={`flex min-w-max ${bad ? "bg-red-100 dark:bg-red-500/15" : ""}`}>
                  <span className={`w-12 shrink-0 ps-2 pe-3 text-end select-none ${bad ? "font-bold text-red-600 dark:text-red-300" : "text-zinc-400 dark:text-zinc-500"}`}>{n}</span>
                  <span className="whitespace-pre pe-3 text-zinc-800 dark:text-zinc-100">{line || " "}</span>
                </div>
                {bad && (
                  <div className="flex min-w-max text-red-600 dark:text-red-300">
                    <span className="w-12 shrink-0" />
                    <span className="whitespace-pre font-bold">
                      {" ".repeat(Math.max(0, output.errorColumn - 1))}^ {t("aboveFold.caret")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    );
  }

  const stats = output.stats;
  const unit = draft.mode === "minify" ? "" : draft.indent === "tab" ? "\t" : " ".repeat(draft.indent);
  const outBytes = draft.mode === "minify" ? a.sizes.minified : draft.indent === "tab" ? a.sizes.tab : draft.indent === 4 ? a.sizes.indent4 : a.sizes.indent2;
  const lineCount = output.result.split("\n").length;

  return (
    <SectionCard
      phoneRole="output"
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        <JSONShareExportModal
          operationLabel=""
          inputRows={[]}
          resultRows={[
            { label: t("aboveFold.statKeys"), value: String(stats.keys) },
            { label: t("aboveFold.statDepth"), value: String(stats.depth) },
            { label: t("aboveFold.statSize"), value: formatBytes(outBytes) },
          ]}
          heroLabel={t("aboveFold.statSize")}
          heroValue={formatBytes(outBytes)}
          sentence={t("shareExport.summarySentence", {
            keys: stats.keys,
            depth: stats.depth,
            size: formatBytes(outBytes),
          })}
        />
      }
    >
      <p className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 size={18} />
        {t("aboveFold.valid")}
      </p>
      <p dir="ltr" className="mt-1 text-center font-mono text-3xl font-bold text-blue-700 dark:text-blue-400">
        {formatBytes(outBytes)}
      </p>
      <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t("aboveFold.summary", {
          lines: f(lineCount),
          keys: f(stats.keys),
          depth: stats.depth,
          nodes: f(a.nodes),
        })}
      </p>
      <div className="mt-4 mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{t("aboveFold.railLegend")}</span>
        <div className="flex gap-2">
          <CopyButton text={output.result} className="px-3 py-2 text-xs" />
          <DownloadButton content={output.result} filename={draft.mode === "minify" ? "minified.json" : "formatted.json"} mimeType="application/json;charset=utf-8" className="px-3 py-2 text-xs" />
        </div>
      </div>
      <div data-preview="visual" className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <JSONCodeView text={output.result} unit={unit} className="max-h-[28rem] lg:max-h-none lg:min-h-[16rem] lg:flex-1 lg:basis-0" />
      </div>
    </SectionCard>
  );
}
