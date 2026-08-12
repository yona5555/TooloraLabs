"use client";
import { useTranslations } from "next-intl";
import type { CsvJsonMode, CsvDelimiter } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

const DELIMITERS: CsvDelimiter[] = [",", ";", "\t", "|", "auto"];

type CsvJsonInputPanelProps = {
  input: string;
  onInputChange: (value: string) => void;
  mode: CsvJsonMode;
  onModeChange: (mode: CsvJsonMode) => void;
  delimiter: CsvDelimiter;
  onDelimiterChange: (delimiter: CsvDelimiter) => void;
  hasHeader: boolean;
  onHasHeaderChange: (value: boolean) => void;
};

export default function CsvJsonInputPanel({
  input,
  onInputChange,
  mode,
  onModeChange,
  delimiter,
  onDelimiterChange,
  hasHeader,
  onHasHeaderChange,
}: CsvJsonInputPanelProps) {
  const t = useTranslations("tools.csv-json-converter.form");

  const delimiterLabel: Record<CsvDelimiter, string> = {
    ",": t("delimiterComma"),
    ";": t("delimiterSemicolon"),
    "\t": t("delimiterTab"),
    "|": t("delimiterPipe"),
    auto: t("delimiterAuto"),
  };

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {(["csvToJson", "jsonToCsv"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`rounded-md px-3 py-2.5 text-sm font-medium transition ${
              mode === m
                ? "bg-blue-600 text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {m === "csvToJson" ? t("csvToJson") : t("jsonToCsv")}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t("delimiterLabel")}</span>
          <select
            value={delimiter}
            onChange={(e) => onDelimiterChange(e.target.value as CsvDelimiter)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {DELIMITERS.map((d) => (
              <option key={d} value={d}>
                {delimiterLabel[d]}
              </option>
            ))}
          </select>
        </div>

        {mode === "csvToJson" && (
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => onHasHeaderChange(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
            />
            {t("hasHeaderLabel")}
          </label>
        )}
      </div>

      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={mode === "csvToJson" ? t("csvPlaceholder") : t("jsonPlaceholder")}
        rows={12}
        spellCheck={false}
        dir="ltr"
        className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
      />
    </SectionCard>
  );
}
