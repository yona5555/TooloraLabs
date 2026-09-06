"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import PhScaleDiagram from "./PhScaleDiagram";
import PhConcentrationBarDiagram from "./PhConcentrationBarDiagram";
import PhSeesawDiagram from "./PhSeesawDiagram";
import PhShareExportModal from "./PhShareExportModal";
import type { PhOperation, PhResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  operation: PhOperation;
  digitStyle: DigitStyle;
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

export default function PhResult({ hasCalculated, result, operation, digitStyle }: Props) {
  const t = useTranslations("tools.ph-calculator.result");
  const tForm = useTranslations("tools.ph-calculator.form");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  if (!hasCalculated) {
    return (
      <SectionCard title={t("heading")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  if (result.error === "non-positive-concentration") {
    return <ErrorCard heading={t("heading")} message={t("nonPositiveConcentration")} />;
  }

  const operationLabel = tForm(`operation.${operation}`);
  const heroValue = fmt(result.pH);

  const formatConcentration = (value: number) => {
    const { mantissa, exponent } = splitScientific(value);
    return `${fmt(mantissa)} × 10^${exponent} M`;
  };

  const inputRows = [{ label: t("operationUsed"), value: operationLabel }];
  const resultRows = [
    { label: t("pH"), value: fmt(result.pH) },
    { label: t("pOH"), value: fmt(result.pOH) },
    { label: t("hConcentration"), value: formatConcentration(result.hConcentration) },
    { label: t("ohConcentration"), value: formatConcentration(result.ohConcentration) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <PhShareExportModal
            operationLabel={operationLabel}
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={t("pH")}
            heroValue={heroValue}
            sentence={t(`classification.${result.classification}`)}
            gauge={{
              zones: [
                { from: 0, to: 6, color: "#ef4444" },
                { from: 6, to: 8, color: "#22c55e" },
                { from: 8, to: 14, color: "#3b82f6" },
              ],
              domainMin: 0,
              domainMax: 14,
              value: result.pH,
              ticks: [0, 6, 7, 8, 14],
            }}
          />
        }
      >
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
          {fmt(result.pH)}
        </p>
        <p className="mt-2 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">{t(`classification.${result.classification}`)}</p>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <PhScaleDiagram pH={result.pH} caption={t("diagramCaption", { value: fmt(result.pH) })} />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <PhConcentrationBarDiagram
            hConcentration={result.hConcentration}
            ohConcentration={result.ohConcentration}
            hLabel={t("hConcentration")}
            ohLabel={t("ohConcentration")}
            caption={t("barCaption")}
          />
        </div>

        <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <RatioGauge
            value={result.pH}
            domainMin={0}
            domainMax={14}
            zones={[
              { key: "acidic", from: 0, to: 6, colorClass: "stroke-red-500 dark:stroke-red-400" },
              { key: "neutral", from: 6, to: 8, colorClass: "stroke-green-500 dark:stroke-green-400" },
              { key: "basic", from: 8, to: 14, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
            ]}
            valueLabel={fmt(result.pH)}
            caption={t(`classification.${result.classification}`)}
            ticks={[0, 6, 7, 8, 14]}
          />
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <PhSeesawDiagram pH={result.pH} pOH={result.pOH} caption={t("seesawCaption")} />
        </div>

        <dl dir="ltr" className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("pOH")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.pOH)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("hConcentration")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
              <ConcentrationValue value={result.hConcentration} digitStyle={digitStyle} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("ohConcentration")}</dt>
            <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
              <ConcentrationValue value={result.ohConcentration} digitStyle={digitStyle} />
            </dd>
          </div>
        </dl>
      </SectionCard>
    </div>
  );
}

function ErrorCard({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{heading}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
