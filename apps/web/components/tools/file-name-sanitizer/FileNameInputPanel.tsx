"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import type { FileNameSanitizerInput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Separator = NonNullable<FileNameSanitizerInput["separator"]>;

const SAMPLE_FILENAME = "My Résumé (Final Draft) — v2.docx";

type FileNameInputPanelProps = {
  fileName: string;
  onFileNameChange: (value: string) => void;
  separator: Separator;
  onSeparatorChange: (separator: Separator) => void;
  lowercase: boolean;
  onLowercaseChange: (value: boolean) => void;
  transliterate: boolean;
  onTransliterateChange: (value: boolean) => void;
  onClear: () => void;
};

export default function FileNameInputPanel({
  fileName,
  onFileNameChange,
  separator,
  onSeparatorChange,
  lowercase,
  onLowercaseChange,
  transliterate,
  onTransliterateChange,
  onClear,
}: FileNameInputPanelProps) {
  const t = useTranslations("tools.file-name-sanitizer.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onFileNameChange(SAMPLE_FILENAME)}
          className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
        >
          {t("loadSampleText")}
        </button>
      </div>
      <div className="space-y-4">
        <ToolInput
          type="text"
          label={t("inputLabel")}
          placeholder={t("inputPlaceholder")}
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
        />

        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("separator")}
          </span>
          <select
            value={separator}
            onChange={(e) => onSeparatorChange(e.target.value as Separator)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="-">{t("separatorDash")}</option>
            <option value="_">{t("separatorUnderscore")}</option>
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(e) => onLowercaseChange(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          {t("lowercase")}
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={transliterate}
            onChange={(e) => onTransliterateChange(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          {t("transliterate")}
        </label>

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={16} />
          {t("clear")}
        </button>
      </div>
    </SectionCard>
  );
}
