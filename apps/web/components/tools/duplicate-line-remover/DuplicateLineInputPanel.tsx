"use client";
import { useTranslations } from "next-intl";
import type { DuplicateLineRemoverInput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

type KeepOccurrence = NonNullable<DuplicateLineRemoverInput["keepOccurrence"]>;

type DuplicateLineInputPanelProps = {
  text: string;
  onTextChange: (value: string) => void;
  caseSensitive: boolean;
  onCaseSensitiveChange: (value: boolean) => void;
  sort: boolean;
  onSortChange: (value: boolean) => void;
  trimWhitespace: boolean;
  onTrimWhitespaceChange: (value: boolean) => void;
  keepOccurrence: KeepOccurrence;
  onKeepOccurrenceChange: (value: KeepOccurrence) => void;
};

export default function DuplicateLineInputPanel({
  text,
  onTextChange,
  caseSensitive,
  onCaseSensitiveChange,
  sort,
  onSortChange,
  trimWhitespace,
  onTrimWhitespaceChange,
  keepOccurrence,
  onKeepOccurrenceChange,
}: DuplicateLineInputPanelProps) {
  const t = useTranslations("tools.duplicate-line-remover.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("inputLabel")}
          </span>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={t("inputPlaceholder")}
            rows={12}
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => onCaseSensitiveChange(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            {t("caseSensitive")}
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={sort}
              onChange={(e) => onSortChange(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            {t("sortLines")}
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => onTrimWhitespaceChange(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            {t("trimWhitespace")}
          </label>
          <label className="block space-y-1.5">
            <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("keepOccurrence")}
            </span>
            <select
              value={keepOccurrence}
              onChange={(e) => onKeepOccurrenceChange(e.target.value as KeepOccurrence)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="first">{t("keepFirst")}</option>
              <option value="last">{t("keepLast")}</option>
            </select>
          </label>
        </div>
      </div>
    </SectionCard>
  );
}
