"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import DensityModeTabs from "./DensityModeTabs";
import type { DensityDraft } from "./DensityLiveContext";
import type { DensityOperation } from "./types";

type NumericKey = "mass" | "volume" | "density";

type DensityInputPanelProps = {
  draft: DensityDraft;
  onChange: <K extends keyof DensityDraft>(key: K, value: DensityDraft[K]) => void;
  onClear: () => void;
};

/** Solve-for tabs and the two known values; every keystroke updates the whole page live. */
export default function DensityInputPanel({ draft, onChange, onClear }: DensityInputPanelProps) {
  const t = useTranslations("tools.density-calculator.form");
  const { operation } = draft;

  const all: { key: NumericKey; label: string; placeholder: string; solvedBy: DensityOperation }[] = [
    { key: "mass", label: t("massLabel"), placeholder: t("massPlaceholder"), solvedBy: "solveMass" },
    { key: "volume", label: t("volumeLabel"), placeholder: t("volumePlaceholder"), solvedBy: "solveVolume" },
    { key: "density", label: t("densityLabel"), placeholder: t("densityPlaceholder"), solvedBy: "solveDensity" },
  ];
  const fields = all.filter((x) => x.solvedBy !== operation);

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <DensityModeTabs operation={operation} onOperationChange={(o) => onChange("operation", o)} />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {fields.map((field) => (
          <ToolInput
            key={field.key}
            label={field.label}
            type="text"
            inputMode="decimal"
            placeholder={field.placeholder}
            value={draft[field.key]}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        ))}

        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("clear")}
        </button>
      </form>
    </SectionCard>
  );
}
