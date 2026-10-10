"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { countSigFigs, eNotation, siPrefixForm, toPlainDecimal } from "@tooloralabs/tools";
import CopyButton from "@/components/tool-ui/CopyButton";
import SectionCard from "@/components/tool-ui/SectionCard";
import ScientificNotationShareExportModal from "./ScientificNotationShareExportModal";
import DecimalShiftStrip from "./DecimalShiftStrip";
import MagnitudeLadder from "./MagnitudeLadder";
import { coef, sup } from "./sciFormat";
import type { ScientificNotationOperation, ScientificNotationResult as Result } from "./types";

type Computed = {
  operation: ScientificNotationOperation;
  standardValue: number;
  coefficientA: number;
  exponentA: number;
  coefficientB: number;
  exponentB: number;
  digitStyle: DigitStyle;
};

type Props = {
  result: Result;
  computed: Computed;
  /** The coefficient text(s) exactly as typed, for the significant-figures row. */
  sigSources: string[];
  onSetExponent: (exponent: number) => void;
};

export default function ScientificNotationResult({ result, computed, sigSources, onSetExponent }: Props) {
  const t = useTranslations("tools.scientific-notation-converter.result");
  const tRoot = useTranslations("tools.scientific-notation-converter");
  const { operation, standardValue, coefficientA, exponentA, coefficientB, exponentB, digitStyle } = computed;

  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 10 });
  const fmtStandard = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 20 });

  if (result.error === "divide-by-zero") {
    return (
      <SectionCard title={t("heading")}>
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("divideByZero")}</p>
      </SectionCard>
    );
  }

  const { scientific, engineering, standard, numberName } = result;
  const copyText = `${fmt(scientific.coefficient)} × 10^${fmt(scientific.exponent)}`;

  let stepSentence: string;
  if (operation === "toScientific") {
    stepSentence = t("stepToScientific", { standard: fmtStandard(standardValue), exponent: fmt(scientific.exponent) });
  } else if (operation === "toStandard") {
    stepSentence = t("stepToStandard", { coefficient: fmt(coefficientA), exponent: fmt(exponentA) });
  } else if (operation === "multiply") {
    stepSentence = t("stepMultiply", { coeffA: fmt(coefficientA), expA: fmt(exponentA), coeffB: fmt(coefficientB), expB: fmt(exponentB), rawCoeff: fmt(coefficientA * coefficientB), rawExp: fmt(exponentA + exponentB) });
  } else {
    stepSentence = t("stepDivide", { coeffA: fmt(coefficientA), expA: fmt(exponentA), coeffB: fmt(coefficientB), expB: fmt(exponentB), rawExp: fmt(exponentA - exponentB) });
  }

  // Significant figures: as typed; for × and ÷ the answer keeps the fewer of the two (standard rule).
  const sigs = sigSources.map(countSigFigs);
  const sig = sigs.reduce((m, s) => (s.count < m.count ? s : m), sigs[0] ?? { count: 0, ambiguous: false });
  const si = siPrefixForm(engineering);
  const words =
    engineering.exponent === 0 ? fmtStandard(standard) : numberName ? `${coef(engineering.coefficient)} ${t(`numberNames.${numberName}`)}` : `${coef(engineering.coefficient)} × 10${sup(engineering.exponent)}`;

  const forms: { key: string; label: string; value: string; note?: string }[] = [
    // Locale grouping where Intl can show every digit; plain positional digits beyond that (e.g. Planck's 10⁻³⁴).
    { key: "standard", label: t("forms.standard"), value: scientific.exponent >= -18 && scientific.exponent <= 20 ? fmtStandard(standard) : toPlainDecimal(scientific.coefficient, scientific.exponent) },
    { key: "scientific", label: t("forms.scientific"), value: `${coef(scientific.coefficient)} × 10${sup(scientific.exponent)}` },
    { key: "engineering", label: t("forms.engineering"), value: `${coef(engineering.coefficient)} × 10${sup(engineering.exponent)}`, note: t("forms.engineeringNote") },
    { key: "e", label: t("forms.eNotation"), value: eNotation(scientific), note: t("forms.eNote") },
    { key: "si", label: t("forms.si"), value: si ? `${si.value} ${si.prefix.symbol || "—"}` : "—", note: si ? (si.prefix.name ? `${si.prefix.name} (10${sup(si.prefix.exponent)})` : t("forms.siBase")) : t("forms.siOut") },
    { key: "words", label: t("forms.words"), value: words },
    { key: "sig", label: t("forms.sigFigs"), value: String(sig.count), note: sig.ambiguous ? t("forms.sigAmbiguous") : operation === "multiply" || operation === "divide" ? t("forms.sigRule") : t("forms.sigNote") },
  ];

  return (
    <SectionCard
      title={t("heading")}
      action={
        <div className="flex items-center gap-2">
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
          <ScientificNotationShareExportModal
            operationLabel=""
            inputRows={[]}
            resultRows={[
              { label: t("heading"), value: copyText },
              { label: tRoot("shareExport.standardLabel"), value: fmtStandard(standard) },
              { label: tRoot("shareExport.engineeringLabel"), value: `${fmt(engineering.coefficient)} × 10^${fmt(engineering.exponent)}` },
              { label: t("forms.eNotation"), value: eNotation(scientific) },
            ]}
            heroLabel={t("heading")}
            heroValue={copyText}
            sentence={stepSentence}
          />
        </div>
      }
    >
      <p dir="ltr" className="text-center font-mono text-3xl font-bold text-blue-700 dark:text-blue-400" data-testid="sci-result">
        {fmt(scientific.coefficient)} × 10<sup>{fmt(scientific.exponent)}</sup>
      </p>

      <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("shift.title")}</h3>
      <div className="mt-1">
        <DecimalShiftStrip coefficient={scientific.coefficient} exponent={scientific.exponent} />
      </div>

      <h3 className="mt-5 border-t border-zinc-200 pt-4 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">{t("ladder.title")}</h3>
      <MagnitudeLadder sci={scientific} onSetExponent={onSetExponent} />

      <h3 className="mt-5 border-t border-zinc-200 pt-4 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">{t("forms.title")}</h3>
      <div className="mt-2 overflow-hidden rounded-xl border border-blue-200 dark:border-blue-500/30">
        <table className="w-full text-sm" data-testid="forms-table">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {forms.map((f) => (
              <tr key={f.key} data-form={f.key}>
                <th scope="row" className="w-[38%] bg-blue-50/60 px-3 py-2 text-start align-top font-semibold text-zinc-700 dark:bg-blue-500/5 dark:text-zinc-300">{f.label}</th>
                <td className="px-3 py-2 text-end">
                  <div dir={f.key === "words" ? undefined : "ltr"} className={`font-semibold ${f.key === "words" ? "break-words" : "break-all font-mono"} text-zinc-900 dark:text-zinc-100`}>{f.value}</div>
                  {f.note && <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{f.note}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{stepSentence}</p>
    </SectionCard>
  );
}
