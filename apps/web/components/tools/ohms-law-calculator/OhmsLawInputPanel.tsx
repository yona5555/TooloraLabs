"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
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
};

const FIELDS_BY_PAIR: Record<OhmsLawKnownPair, ("voltage" | "current" | "resistance" | "power")[]> = {
  VI: ["voltage", "current"],
  VR: ["voltage", "resistance"],
  IR: ["current", "resistance"],
  VP: ["voltage", "power"],
  IP: ["current", "power"],
  RP: ["resistance", "power"],
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
}: OhmsLawInputPanelProps) {
  const t = useTranslations("tools.ohms-law-calculator.form");
  const activeFields = FIELDS_BY_PAIR[knownPair];

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("knownPairLabel")}</span>
        <select
          value={knownPair}
          onChange={(e) => onKnownPairChange(e.target.value as OhmsLawKnownPair)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          <option value="VI">{t("pair.VI")}</option>
          <option value="VR">{t("pair.VR")}</option>
          <option value="IR">{t("pair.IR")}</option>
          <option value="VP">{t("pair.VP")}</option>
          <option value="IP">{t("pair.IP")}</option>
          <option value="RP">{t("pair.RP")}</option>
        </select>
      </label>

      <div className="mt-5 space-y-5">
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
      </div>
    </SectionCard>
  );
}
