"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ProbabilityModeTabs from "./ProbabilityModeTabs";
import type { ProbabilityMode } from "./types";

export type ProbabilityFields = {
  favorable: string;
  total: string;
  pA: string;
  pB: string;
  pBoth: string;
  pAAndB: string;
};

type Props = {
  mode: ProbabilityMode;
  onModeChange: (mode: ProbabilityMode) => void;
  fields: ProbabilityFields;
  onFieldChange: (field: keyof ProbabilityFields, value: string) => void;
};

export default function ProbabilityInputPanel({ mode, onModeChange, fields, onFieldChange }: Props) {
  const t = useTranslations("tools.probability-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4">
        <ProbabilityModeTabs mode={mode} onModeChange={onModeChange} />
      </div>

      <div className="space-y-3">
        {mode === "single" && (
          <>
            <ToolInput label={t("fields.favorable")} type="text" inputMode="decimal" value={fields.favorable} onChange={(e) => onFieldChange("favorable", e.target.value)} />
            <ToolInput label={t("fields.total")} type="text" inputMode="decimal" value={fields.total} onChange={(e) => onFieldChange("total", e.target.value)} />
          </>
        )}

        {mode === "and" && (
          <>
            <ToolInput label={t("fields.pA")} type="text" inputMode="decimal" value={fields.pA} onChange={(e) => onFieldChange("pA", e.target.value)} />
            <ToolInput label={t("fields.pB")} type="text" inputMode="decimal" value={fields.pB} onChange={(e) => onFieldChange("pB", e.target.value)} />
          </>
        )}

        {mode === "or" && (
          <>
            <ToolInput label={t("fields.pA")} type="text" inputMode="decimal" value={fields.pA} onChange={(e) => onFieldChange("pA", e.target.value)} />
            <ToolInput label={t("fields.pB")} type="text" inputMode="decimal" value={fields.pB} onChange={(e) => onFieldChange("pB", e.target.value)} />
            <ToolInput label={t("fields.pBoth")} type="text" inputMode="decimal" value={fields.pBoth} onChange={(e) => onFieldChange("pBoth", e.target.value)} />
          </>
        )}

        {mode === "conditional" && (
          <>
            <ToolInput label={t("fields.pAAndB")} type="text" inputMode="decimal" value={fields.pAAndB} onChange={(e) => onFieldChange("pAAndB", e.target.value)} />
            <ToolInput label={t("fields.pB")} type="text" inputMode="decimal" value={fields.pB} onChange={(e) => onFieldChange("pB", e.target.value)} />
          </>
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t(`hints.${mode}`)}</p>
    </SectionCard>
  );
}
