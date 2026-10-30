"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import DownloadButton from "@/components/tool-ui/DownloadButton";
import CsvJsonShareExportModal from "./CsvJsonShareExportModal";
import { delimiterName, TYPE_BG, useCsvModel } from "./CsvLiveContext";

const ERROR_KEYS: Record<string, string> = { INVALID_JSON: "invalidJson", EXPECTED_ARRAY: "expectedArray", EMPTY_INPUT: "required" };
const PREVIEW_ROWS = 12;

/**
 * Result card: the converted text with copy / download, then the table both formats share — every
 * column headed by its inferred type, empty cells marked — so you see exactly what was parsed.
 */
export default function CsvJsonResult() {
  const t = useTranslations("tools.csv-json-converter");
  const tr = useTranslations("tools.csv-json-converter.result");
  const tt = useTranslations("tools.csv-json-converter.education.lab.types");
  const { draft, result, error, delimiter, a, f } = useCsvModel();
  const toJson = draft.mode === "csvToJson";
  const modeLabel = toJson ? t("form.csvToJson") : t("form.jsonToCsv");
  const filename = toJson ? "converted.json" : "converted.csv";

  if (error || !a) {
    return (
      <SectionCard phoneRole="output" title={t("aboveFold.resultTitle")}>
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{t(`errors.${ERROR_KEYS[error] ?? "required"}`)}</p>
        </div>
      </SectionCard>
    );
  }

  const lineCount = result.split("\n").length;

  return (
    <SectionCard
      phoneRole="output"
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        <CsvJsonShareExportModal
          operationLabel={modeLabel}
          inputRows={[]}
          resultRows={[
            { label: t("form.outputLabel"), value: filename },
            { label: t("shareExport.lineCount"), value: String(lineCount) },
            { label: t("shareExport.charCount"), value: String(result.length) },
          ]}
          heroLabel={t("form.outputLabel")}
          heroValue={filename}
          sentence={`${modeLabel} — ${lineCount} lines, ${result.length} characters.`}
        />
      }
    >
      <p className="text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">{tr("summary", { rows: f(a.rows.length), cols: f(a.headers.length), delim: delimiterName(delimiter) })}</p>
      <div className="mt-3 mb-2 flex items-center justify-end gap-2">
        <CopyButton text={result} className="px-3 py-2 text-xs" />
        <DownloadButton content={result} filename={filename} mimeType={toJson ? "application/json;charset=utf-8" : "text/csv;charset=utf-8"} className="px-3 py-2 text-xs" />
      </div>
      <textarea
        readOnly
        aria-label={t("form.outputLabel")}
        value={result}
        rows={7}
        dir="ltr"
        spellCheck={false}
        className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-900 outline-none lg:min-h-[8rem] lg:flex-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />

      <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{tr("table")}</p>
      <div dir="ltr" data-preview="visual" tabIndex={0} className="max-h-80 shrink-0 overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800">
            <tr>
              {a.columns.map((c) => (
                <th key={c.name} className="px-2 py-1.5 text-start font-semibold whitespace-nowrap text-zinc-700 dark:text-zinc-200">
                  <span className="block">{c.name}</span>
                  <span className={`mt-0.5 inline-block rounded px-1 text-xs font-bold text-white ${TYPE_BG[c.type]}`}>{tt(c.type)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a.rows.slice(0, PREVIEW_ROWS).map((r, i) => (
              <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                {r.map((v, k) => (
                  <td key={k} className={`max-w-[10rem] truncate px-2 py-1.5 ${v === "" ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10" : "text-zinc-700 dark:text-zinc-200"}`}>
                    {v === "" ? "∅" : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {a.rows.length > PREVIEW_ROWS && <p className="px-2 py-1.5 text-center text-xs text-zinc-500">+{f(a.rows.length - PREVIEW_ROWS)}</p>}
      </div>
    </SectionCard>
  );
}
