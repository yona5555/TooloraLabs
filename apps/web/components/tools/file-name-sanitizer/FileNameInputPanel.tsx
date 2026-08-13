"use client";
import { useTranslations } from "next-intl";
import type { FileNameSanitizerInput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Separator = NonNullable<FileNameSanitizerInput["separator"]>;

type FileNameInputPanelProps = {
  fileName: string;
  onFileNameChange: (value: string) => void;
  separator: Separator;
  onSeparatorChange: (separator: Separator) => void;
  lowercase: boolean;
  onLowercaseChange: (value: boolean) => void;
  transliterate: boolean;
  onTransliterateChange: (value: boolean) => void;
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
}: FileNameInputPanelProps) {
  const t = useTranslations("tools.file-name-sanitizer.form");

  return (
    <SectionCard title={t("inputTitle")}>
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
      </div>
    </SectionCard>
  );
}
