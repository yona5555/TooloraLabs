"use client";
import { Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UnitCategory } from "@tooloralabs/tools";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import { Chem } from "@/components/tool-ui/indicator-kit/CardKit";
import { sci } from "@/components/tool-ui/indicator-kit/format";
import UnitShareExportModal from "./UnitShareExportModal";
import UnitGauge from "./UnitGauge";
import { DEFAULT_VALUE, UNIT_SYMBOL, UNITS_BY_CATEGORY } from "./units";

const selectClass =
  "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

type UnitResultProps = {
  category: UnitCategory;
  from: string;
  fromValue: string;
  /** The parsed "Value" field (the scene's handle position). */
  numericValue: number;
  onSetValue: (v: number) => void;
  conv: (v: number) => number;
  to: string;
  onToChange: (unit: string) => void;
  result: number | null;
  allConversions: Record<string, number>;
  digitStyle: DigitStyle;
};

/** Very large or very small results switch to scientific notation with a real superscript. */
const isExtreme = (v: number) => v !== 0 && (Math.abs(v) >= 1e7 || Math.abs(v) < 1e-3);

/**
 * §44 (2D): the Result card carries the converter's main visual at its top — the double-ring
 * gauge of the "from" and "to" units — then the converted value, the "to" unit switch and every unit at once.
 */
export default function UnitResult({ category, from, fromValue, numericValue, onSetValue, conv, to, onToChange, result, allConversions, digitStyle }: UnitResultProps) {
  const t = useTranslations("tools.unit-converter");
  const tc = useTranslations("toolPage.indicatorKit");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 6 });
  const shown = (value: number) => (isExtreme(value) ? sci(value, 3) : money(value));
  const heroValue = result !== null ? `${shown(result)} ${t(`units.${to}`)}` : "";

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard
        id="unit-result"
        title={t("aboveFold.resultTitle")}
        className="flex flex-col lg:flex-1"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {result !== null && (
              <UnitShareExportModal
                operationLabel=""
                inputRows={[{ label: t("shareExport.fromValueLabel"), value: `${fromValue} ${t(`units.${from}`)}` }]}
                resultRows={Object.entries(allConversions).map(([unit, value]) => ({
                  label: t(`units.${unit}`),
                  value: shown(value),
                }))}
                heroLabel={t(`units.${to}`)}
                heroValue={heroValue}
                sentence={`${fromValue} ${t(`units.${from}`)} = ${heroValue}.`}
              />
            )}
          </span>
        }
      >
        <UnitGauge category={category} from={from} value={numericValue} seed={DEFAULT_VALUE} conv={conv} onSet={onSetValue} fromSym={UNIT_SYMBOL[from]} toSym={UNIT_SYMBOL[to]} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />

        <div data-ph-result-values className="flex flex-col">
          <div className="flex items-center justify-center gap-2">
            <select value={to} onChange={(e) => onToChange(e.target.value)} className={selectClass} aria-label={t("form.to")}>
              {UNITS_BY_CATEGORY[category].map((unit) => (
                <option key={unit} value={unit}>
                  {t(`units.${unit}`)}
                </option>
              ))}
            </select>
          </div>

          <p dir="ltr" data-testid="unit-result-main" className="mt-4 text-center text-4xl font-bold tabular-nums text-blue-700 dark:text-blue-400">
            {result !== null ? <Chem text={shown(result)} /> : "—"} <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">{UNIT_SYMBOL[to]}</span>
          </p>

          {result !== null && (
            <div className="mt-4 flex justify-center">
              <CopyButton text={`${shown(result)} ${t(`units.${to}`)}`} />
            </div>
          )}

          <div className="mt-4 flex flex-col border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300">{t("aboveFold.allUnitsTitle")}</p>
            {/* Natural-height rows; the gauge above takes any spare height, so the column ends flush (§41). */}
            <div className="flex flex-col gap-1.5">
              {UNITS_BY_CATEGORY[category].map((unit) => (
                <div
                  key={unit}
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-sm ${
                    unit === to ? "bg-blue-50 dark:bg-blue-500/10" : "border border-zinc-100 dark:border-zinc-800/60"
                  }`}
                >
                  <span className="text-zinc-600 dark:text-zinc-300">{t(`units.${unit}`)}</span>
                  <span dir="ltr" className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {allConversions[unit] !== undefined ? <Chem text={shown(allConversions[unit])} /> : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
