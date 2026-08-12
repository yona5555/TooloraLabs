"use client";
import { useTranslations } from "next-intl";
import type { JSONFormatterMode, JSONIndent } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

const INDENTS: JSONIndent[] = [2, 4, "tab"];

type JSONInputPanelProps = {
  json: string;
  onJsonChange: (value: string) => void;
  mode: JSONFormatterMode;
  onModeChange: (mode: JSONFormatterMode) => void;
  indent: JSONIndent;
  onIndentChange: (indent: JSONIndent) => void;
  sortKeys: boolean;
  onSortKeysChange: (value: boolean) => void;
};

export default function JSONInputPanel({
  json,
  onJsonChange,
  mode,
  onModeChange,
  indent,
  onIndentChange,
  sortKeys,
  onSortKeysChange,
}: JSONInputPanelProps) {
  const t = useTranslations("tools.json-formatter.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {(["format", "minify"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {m === "format" ? t("modeFormat") : t("modeMinify")}
            </button>
          ))}
        </div>

        {mode === "format" && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t("indentLabel")}</span>
            <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
              {INDENTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onIndentChange(value)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    indent === value
                      ? "bg-blue-600 text-white"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {value === "tab" ? t("indentTab") : value}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={sortKeys}
          onChange={(e) => onSortKeysChange(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
        />
        {t("sortKeysLabel")}
      </label>

      <textarea
        value={json}
        onChange={(e) => onJsonChange(e.target.value)}
        placeholder={t("inputPlaceholder")}
        rows={12}
        spellCheck={false}
        dir="ltr"
        className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
      />
    </SectionCard>
  );
}
