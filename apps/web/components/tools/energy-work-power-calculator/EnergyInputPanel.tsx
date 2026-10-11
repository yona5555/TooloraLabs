"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import EnergyModeTabs from "./EnergyModeTabs";
import type { EnergyDraft } from "./EnergyLiveContext";
import type { EnergyWorkPowerMode } from "./types";

type NumericKey = Exclude<keyof EnergyDraft, "mode">;

type EnergyInputPanelProps = {
  draft: EnergyDraft;
  onChange: <K extends keyof EnergyDraft>(key: K, value: EnergyDraft[K]) => void;
  onClear: () => void;
};

const FIELDS: Record<EnergyWorkPowerMode, { key: NumericKey; label: string; placeholder: string }[]> = {
  work: [
    { key: "force", label: "forceLabel", placeholder: "forcePlaceholder" },
    { key: "distance", label: "distanceLabel", placeholder: "distancePlaceholder" },
    { key: "angleDegrees", label: "angleLabel", placeholder: "anglePlaceholder" },
  ],
  kineticEnergy: [
    { key: "mass", label: "massLabel", placeholder: "massPlaceholder" },
    { key: "velocity", label: "velocityLabel", placeholder: "velocityPlaceholder" },
  ],
  potentialEnergy: [
    { key: "mass", label: "massLabel", placeholder: "massPlaceholder" },
    { key: "height", label: "heightLabel", placeholder: "heightPlaceholder" },
  ],
  power: [
    { key: "workValue", label: "workValueLabel", placeholder: "workValuePlaceholder" },
    { key: "time", label: "timeLabel", placeholder: "timePlaceholder" },
  ],
};

/** Formula and its known values; every keystroke updates the whole page live. */
export default function EnergyInputPanel({ draft, onChange, onClear }: EnergyInputPanelProps) {
  const t = useTranslations("tools.energy-work-power-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("modeLabel")}</span>
        <EnergyModeTabs mode={draft.mode} onModeChange={(m) => onChange("mode", m)} />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {FIELDS[draft.mode].map((field) => (
          <ToolInput
            key={field.key}
            label={t(field.label)}
            type="text"
            inputMode="decimal"
            placeholder={t(field.placeholder)}
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
