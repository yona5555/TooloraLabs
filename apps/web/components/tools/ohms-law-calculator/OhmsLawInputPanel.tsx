"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import OhmsLawModeTabs from "./OhmsLawModeTabs";
import OhmsLawTriangleDiagram from "./OhmsLawTriangleDiagram";
import type { OhmsLawKnownPair } from "./types";

type OhmsLawInputPanelProps = {
  knownPair: OhmsLawKnownPair;
  onKnownPairChange: (pair: OhmsLawKnownPair) => void;
  voltage: string;
  onVoltageChange: (value: string) => void;
  current: string;
  onCurrentChange: (value: string) => void;
  resistance: string;
  onResistanceChange: (value: string) => void;
  power: string;
  onPowerChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

const FIELDS_BY_PAIR: Record<OhmsLawKnownPair, ("voltage" | "current" | "resistance" | "power")[]> = {
  VI: ["voltage", "current"],
  VR: ["voltage", "resistance"],
  IR: ["current", "resistance"],
  VP: ["voltage", "power"],
  IP: ["current", "power"],
  RP: ["resistance", "power"],
};

const UNKNOWN_BY_PAIR: Record<OhmsLawKnownPair, ("voltage" | "current" | "resistance")[]> = {
  VI: ["resistance"],
  VR: ["current"],
  IR: ["voltage"],
  VP: ["current", "resistance"],
  IP: ["voltage", "resistance"],
  RP: ["voltage", "current"],
};

export default function OhmsLawInputPanel({
  knownPair,
  onKnownPairChange,
  voltage,
  onVoltageChange,
  current,
  onCurrentChange,
  resistance,
  onResistanceChange,
  power,
  onPowerChange,
  onCalculate,
  onClear,
}: OhmsLawInputPanelProps) {
  const t = useTranslations("tools.ohms-law-calculator.form");
  const activeFields = FIELDS_BY_PAIR[knownPair];

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("knownPairLabel")}</span>
        <OhmsLawModeTabs knownPair={knownPair} onKnownPairChange={onKnownPairChange} />
      </div>

      <OhmsLawTriangleDiagram voltageText="V" currentText="I" resistanceText="R" highlighted={UNKNOWN_BY_PAIR[knownPair]} caption={t("triangleCaption")} />

      <form onSubmit={onCalculate} className="mt-4 space-y-5">
        {activeFields.includes("voltage") && (
          <ToolInput
            label={t("voltageLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("voltagePlaceholder")}
            value={voltage}
            onChange={(e) => onVoltageChange(e.target.value)}
          />
        )}
        {activeFields.includes("current") && (
          <ToolInput
            label={t("currentLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("currentPlaceholder")}
            value={current}
            onChange={(e) => onCurrentChange(e.target.value)}
          />
        )}
        {activeFields.includes("resistance") && (
          <ToolInput
            label={t("resistanceLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("resistancePlaceholder")}
            value={resistance}
            onChange={(e) => onResistanceChange(e.target.value)}
          />
        )}
        {activeFields.includes("power") && (
          <ToolInput
            label={t("powerLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("powerPlaceholder")}
            value={power}
            onChange={(e) => onPowerChange(e.target.value)}
          />
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
