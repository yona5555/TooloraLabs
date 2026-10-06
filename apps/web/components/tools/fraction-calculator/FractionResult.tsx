import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import "@/components/tool-ui/glass/glass-tokens.css";
import FractionResultGauge from "./FractionResultGauge";
import FractionShareExportModal from "./FractionShareExportModal";
import type { FractionOperation, FractionResult as Result } from "./types";

type Computed = {
  operation: FractionOperation;
  numeratorA: number;
  denominatorA: number;
  numeratorB: number;
  denominatorB: number;
  digitStyle: DigitStyle;
};

type Props = {
  result: Result;
  computed: Computed;
};

const OPERATION_SYMBOL: Record<FractionOperation, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};

function FractionGlyph({ numerator, denominator }: { numerator: number; denominator: number }) {
  if (denominator === 1) {
    return <span>{numerator}</span>;
  }
  return (
    <span className="inline-flex flex-col items-center align-middle text-[0.6em] leading-none">
      <span className="border-b-2 border-current px-1 pb-0.5">{numerator}</span>
      <span className="px-1 pt-0.5">{denominator}</span>
    </span>
  );
}

export default function FractionResult({ result, computed }: Props) {
  const t = useTranslations("tools.fraction-calculator.result");
  const tForm = useTranslations("tools.fraction-calculator.form");
  const { operation, numeratorA, denominatorA, numeratorB, denominatorB, digitStyle } = computed;

  const num = (value: number) => formatLocalizedNumber(value, digitStyle);

  if (result.error === "zero-denominator") {
    return (
      <SectionCard title={t("heading")}>
        <p className="text-center text-sm leading-6" style={{ color: "var(--glass-subtitle)" }}>
          {t("zeroDenominator")}
        </p>
      </SectionCard>
    );
  }

  if (result.error === "divide-by-zero") {
    return (
      <SectionCard title={t("heading")}>
        <p className="text-center text-sm leading-6" style={{ color: "var(--glass-subtitle)" }}>
          {t("divideByZeroFraction")}
        </p>
      </SectionCard>
    );
  }

  const heroValue = result.isWholeNumber
    ? num(result.result.numerator)
    : `${num(result.result.numerator)}/${num(result.result.denominator)}`;

  const inputRows = [
    { label: tForm("fractionALabel"), value: `${num(numeratorA)}/${num(denominatorA)}` },
    { label: tForm("fractionBLabel"), value: `${num(numeratorB)}/${num(denominatorB)}` },
  ];
  const resultRows = [{ label: t("decimalLabel"), value: num(result.decimal) }];

  const stepSentence =
    operation === "add" || operation === "subtract"
      ? t("stepAddSubtract", {
          scaledA: num(result.scaledNumeratorA ?? 0),
          scaledB: num(result.scaledNumeratorB ?? 0),
          commonDenominator: num(result.commonDenominator ?? 1),
        })
      : operation === "multiply"
        ? t("stepMultiply", {
            numA: num(numeratorA),
            numB: num(numeratorB),
            denA: num(denominatorA),
            denB: num(denominatorB),
          })
        : t("stepDivide", {
            numA: num(numeratorA),
            denA: num(denominatorA),
            numB: num(denominatorB),
            denB: num(numeratorB),
          });

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title={t("heading")} action={<FractionShareExportModal inputRows={inputRows} resultRows={resultRows} heroLabel={t("heading")} heroValue={heroValue} sentence={stepSentence} />}>
        <div dir="ltr" className="flex items-center justify-center gap-3 font-mono text-4xl font-bold" style={{ color: "var(--glass-accent-1-strong)" }}>
          <FractionGlyph numerator={numeratorA} denominator={denominatorA} />
          <span className="text-2xl opacity-70">{OPERATION_SYMBOL[operation]}</span>
          <FractionGlyph numerator={numeratorB} denominator={denominatorB} />
          <span className="text-2xl opacity-70">=</span>
          <FractionGlyph numerator={result.result.numerator} denominator={result.result.denominator} />
        </div>

        {result.mixed && (
          <p className="mt-3 text-center text-sm" style={{ color: "var(--glass-muted)" }}>
            {t("mixedNumber", {
              whole: num(result.mixed.whole),
              numerator: num(result.mixed.numerator),
              denominator: num(result.mixed.denominator),
            })}
          </p>
        )}

        <p className="mt-1 text-center text-sm" style={{ color: "var(--glass-muted)" }}>
          {t("decimalEquivalent", { value: num(result.decimal) })}
        </p>

        <FractionResultGauge
          numerator={result.result.numerator}
          denominator={result.result.denominator}
          caption={t("diagramCaption", {
            numerator: num(result.result.numerator),
            denominator: num(result.result.denominator),
          })}
        />

        <p className="mt-4 pt-4 text-sm leading-6" style={{ borderTop: "1px solid var(--glass-table-row-border)", color: "var(--glass-subtitle)" }}>
          {stepSentence}
        </p>
      </SectionCard>
    </div>
  );
}
