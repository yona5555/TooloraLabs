"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { AmountUnit } from "./types";

const selectClassName =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20";

type StoichiometryInputPanelProps = {
  knownFormula: string;
  onKnownFormulaChange: (value: string) => void;
  knownCoefficient: string;
  onKnownCoefficientChange: (value: string) => void;
  knownAmount: string;
  onKnownAmountChange: (value: string) => void;
  knownUnit: AmountUnit;
  onKnownUnitChange: (value: AmountUnit) => void;
  targetFormula: string;
  onTargetFormulaChange: (value: string) => void;
  targetCoefficient: string;
  onTargetCoefficientChange: (value: string) => void;
  targetUnit: AmountUnit;
  onTargetUnitChange: (value: AmountUnit) => void;
};

export default function StoichiometryInputPanel({
  knownFormula,
  onKnownFormulaChange,
  knownCoefficient,
  onKnownCoefficientChange,
  knownAmount,
  onKnownAmountChange,
  knownUnit,
  onKnownUnitChange,
  targetFormula,
  onTargetFormulaChange,
  targetCoefficient,
  onTargetCoefficientChange,
  targetUnit,
  onTargetUnitChange,
}: StoichiometryInputPanelProps) {
  const t = useTranslations("tools.stoichiometry-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("knownLabel")}</p>
          <div className="space-y-3">
            <ToolInput label={t("formulaLabel")} dir="ltr" value={knownFormula} onChange={(e) => onKnownFormulaChange(e.target.value)} placeholder={t("knownFormulaPlaceholder")} />
            <ToolInput label={t("coefficientLabel")} type="text" inputMode="numeric" value={knownCoefficient} onChange={(e) => onKnownCoefficientChange(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <ToolInput label={t("amountLabel")} type="text" inputMode="decimal" value={knownAmount} onChange={(e) => onKnownAmountChange(e.target.value)} />
              <label className="block space-y-2">
                <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("unitLabel")}</span>
                <select value={knownUnit} onChange={(e) => onKnownUnitChange(e.target.value as AmountUnit)} className={selectClassName}>
                  <option value="grams">{t("unit.grams")}</option>
                  <option value="moles">{t("unit.moles")}</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("targetLabel")}</p>
          <div className="space-y-3">
            <ToolInput label={t("formulaLabel")} dir="ltr" value={targetFormula} onChange={(e) => onTargetFormulaChange(e.target.value)} placeholder={t("targetFormulaPlaceholder")} />
            <ToolInput label={t("coefficientLabel")} type="text" inputMode="numeric" value={targetCoefficient} onChange={(e) => onTargetCoefficientChange(e.target.value)} />
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("unitLabel")}</span>
              <select value={targetUnit} onChange={(e) => onTargetUnitChange(e.target.value as AmountUnit)} className={selectClassName}>
                <option value="grams">{t("unit.grams")}</option>
                <option value="moles">{t("unit.moles")}</option>
              </select>
            </label>
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("coefficientHint")}</p>
      </div>
    </SectionCard>
  );
}
