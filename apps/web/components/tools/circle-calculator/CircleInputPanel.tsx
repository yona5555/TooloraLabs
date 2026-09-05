"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { CIRCLE_KNOWN_FIELDS } from "./types";
import type { CircleKnownField } from "./types";

type Props = {
  knownField: CircleKnownField;
  onKnownFieldChange: (field: CircleKnownField) => void;
  value: string;
  onValueChange: (value: string) => void;
};

export default function CircleInputPanel({ knownField, onKnownFieldChange, value, onValueChange }: Props) {
  const t = useTranslations("tools.circle-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div>
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("knownFieldLabel")}</span>
        <div className="grid grid-cols-2 gap-1.5">
          {CIRCLE_KNOWN_FIELDS.map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => onKnownFieldChange(field)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                knownField === field
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t(`fields.${field}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <ToolInput label={t(`fields.${knownField}`)} type="text" inputMode="decimal" value={value} onChange={(e) => onValueChange(e.target.value)} />
      </div>
    </SectionCard>
  );
}
