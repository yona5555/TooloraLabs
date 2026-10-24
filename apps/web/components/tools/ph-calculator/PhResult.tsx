"use client";
import { Calculator, Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import PhShareExportModal from "./PhShareExportModal";
import PhModeTabs from "./PhModeTabs";
import { Chem } from "@/components/tool-ui/indicator-kit/CardKit";
import PhResultScene from "./PhHero";
import { useTokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";
import type { PhOperation, PhResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  operation: PhOperation;
  digitStyle: DigitStyle;
  /** pH the 3D scene shows (the result, or the seed before the first calculation). */
  scenePh: number;
  onSetPh: (pH: number) => void;
  onOperationChange: (operation: PhOperation) => void;
};

function splitScientific(value: number): { mantissa: number; exponent: number } {
  if (value === 0) return { mantissa: 0, exponent: 0 };
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  return { mantissa, exponent };
}

function ConcentrationValue({ value, digitStyle }: { value: number; digitStyle: DigitStyle }) {
  const { mantissa, exponent } = splitScientific(value);
  return (
    <span dir="ltr">
      {formatLocalizedNumber(mantissa, digitStyle, { maximumFractionDigits: 2 })} × 10
      <sup>{exponent}</sup> M
    </span>
  );
}

/**
 * §44: the Result card is the 3D card — the beaker scene first, directly under the header band,
 * then the pH value and status, then pOH / [H⁺] / [OH⁻], then the conversion tabs, all inside
 * this one card. Symbol labels are never uppercased (pOH stays pOH).
 */
export default function PhResult({ hasCalculated, result, operation, digitStyle, scenePh, onSetPh, onOperationChange }: Props) {
  const t = useTranslations("tools.ph-calculator.result");
  const tForm = useTranslations("tools.ph-calculator.form");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });
  // Export gauge zones use the universal-indicator data tokens (acid red / neutral green / base blue).
  const zone = useTokenColors(["--ph-ui-1", "--ph-ui-7", "--ph-ui-11"]);
  const valid = hasCalculated && result.error !== "non-positive-concentration";

  const operationLabel = tForm(`operation.${operation}`);
  const formatConcentration = (value: number) => {
    const { mantissa, exponent } = splitScientific(value);
    return `${fmt(mantissa)} × 10^${exponent} M`;
  };
  const inputRows = [{ label: t("operationUsed"), value: operationLabel }];
  const resultRows = [
    { label: tForm("pHLabel"), value: fmt(result.pH) },
    { label: t("pOH"), value: fmt(result.pOH) },
    { label: t("hConcentration"), value: formatConcentration(result.hConcentration) },
    { label: t("ohConcentration"), value: formatConcentration(result.ohConcentration) },
  ];
  const dtClass = "text-xs font-semibold tracking-wide text-zinc-600 normal-case dark:text-zinc-300";

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard phoneRole="output"
        id="ph-result"
        title={t("heading")}
        className="flex flex-col lg:flex-1"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {valid && (
              <PhShareExportModal
                operationLabel={operationLabel}
                inputRows={inputRows}
                resultRows={resultRows}
                heroLabel={tForm("pHLabel")}
                heroValue={fmt(result.pH)}
                sentence={t(`classification.${result.classification}`)}
                gauge={{
                  zones: [
                    { from: 0, to: 6, color: zone?.["--ph-ui-1"] ?? "currentColor" },
                    { from: 6, to: 8, color: zone?.["--ph-ui-7"] ?? "currentColor" },
                    { from: 8, to: 14, color: zone?.["--ph-ui-11"] ?? "currentColor" },
                  ],
                  domainMin: 0,
                  domainMax: 14,
                  value: result.pH,
                  ticks: [0, 6, 7, 8, 14],
                }}
              />
            )}
          </span>
        }
      >
        <PhResultScene pH={scenePh} onSetPh={onSetPh} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
        <div data-ph-result-values>
          {!hasCalculated ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <Calculator size={28} className="text-zinc-400 dark:text-zinc-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("emptyStateMessage")}</p>
            </div>
          ) : !valid ? (
            <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("nonPositiveConcentration")}</p>
          ) : (
            <>
              <p dir="ltr" data-testid="ph-result-ph" className="text-center text-4xl font-bold text-blue-700 dark:text-blue-400">
                {fmt(result.pH)}
              </p>
              <p data-testid="ph-result-class" className="mt-1 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {t(`classification.${result.classification}`)}
              </p>
              <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
              <dl dir="ltr" data-ph-subvalues className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className={dtClass}>{t("pOH")}</dt>
                  <dd className="text-xs font-semibold whitespace-nowrap text-zinc-800 sm:text-sm dark:text-zinc-100">{fmt(result.pOH)}</dd>
                </div>
                <div>
                  <dt className={dtClass}><Chem text={t("hConcentration")} /></dt>
                  <dd className="text-xs font-semibold whitespace-nowrap text-zinc-800 sm:text-sm dark:text-zinc-100">
                    <ConcentrationValue value={result.hConcentration} digitStyle={digitStyle} />
                  </dd>
                </div>
                <div>
                  <dt className={dtClass}><Chem text={t("ohConcentration")} /></dt>
                  <dd className="text-xs font-semibold whitespace-nowrap text-zinc-800 sm:text-sm dark:text-zinc-100">
                    <ConcentrationValue value={result.ohConcentration} digitStyle={digitStyle} />
                  </dd>
                </div>
              </dl>
            </>
          )}
        </div>

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
        <div data-ph-mode-tabs>
          <PhModeTabs operation={operation} onOperationChange={onOperationChange} />
        </div>
      </SectionCard>
    </div>
  );
}
