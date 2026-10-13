"use client";
import type { ReactNode } from "react";
import { Calculator, Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { RichText } from "@/components/tool-ui/indicator-kit/CardKit";
import { balancedText, molarMassOf, uniFormula } from "../chemical-equation-balancer/chemMath";
import StoichiometryShareExportModal from "./StoichiometryShareExportModal";
import StoichiometryResultScene from "./StoichiometryResultScene";
import { inferReaction } from "./stoichMath";
import type { StoItem } from "./StoichiometryResultScene3D";
import type { StoichiometryResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  knownFormula: string;
  knownCoefficient: number;
  targetCoefficient: number;
  knownUnit: "grams" | "moles";
  targetFormula: string;
  targetUnit: "grams" | "moles";
  digitStyle: DigitStyle;
  /** The known amount field (the scene's draggable marker) and its default. */
  knownAmount: number;
  seedAmount: number;
  onSetKnownAmount: (v: number) => void;
};

/**
 * §44: the Result card is the 3D card — the balanced reaction scene first, directly under the
 * header band, then the target amount, the four-step roadmap and both molar masses, in this one card.
 */
export default function StoichiometryResult({ hasCalculated, result, knownFormula, knownCoefficient, targetCoefficient, knownUnit, targetFormula, targetUnit, digitStyle, knownAmount, seedAmount, onSetKnownAmount }: Props) {
  const t = useTranslations("tools.stoichiometry-calculator.result");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 5 });
  // On screen: 1 000 000 and above as "5.00 × 10⁶" with a real superscript (rule 39: never a row-wide number).
  const show = (value: number): ReactNode => {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) < 1e6) return formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: Math.abs(value) >= 1000 ? 2 : 4 });
    let e = Math.floor(Math.log10(Math.abs(value)));
    let m = value / 10 ** e;
    if (Number(m.toFixed(2)) >= 10) {
      m /= 10;
      e += 1;
    }
    return (
      <bdi dir="ltr" className="whitespace-nowrap">
        {formatLocalizedNumber(m, digitStyle, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × 10<sup>{formatLocalizedNumber(e, digitStyle)}</sup>
      </bdi>
    );
  };
  const valid = hasCalculated && !result.error;
  const errorKey =
    result.error === "invalid-known-formula"
      ? "invalidKnownFormula"
      : result.error === "invalid-target-formula"
        ? "invalidTargetFormula"
        : result.error === "invalid-coefficient"
          ? "invalidCoefficient"
          : result.error
            ? "invalidAmount"
            : null;

  const molUnit = t("molUnit");
  const unitLabel = targetUnit === "grams" ? "g" : molUnit;
  const knownUnitLabel = knownUnit === "grams" ? "g" : molUnit;
  const heroValue = `${fmt(result.targetAmount)} ${unitLabel}`;
  // The balanced reaction behind known → target; every amount follows the calculator's own moles.
  const terms = inferReaction(knownFormula, knownCoefficient, targetFormula, targetCoefficient);
  const known = terms[0];
  const extent = valid && known.coefficient > 0 ? result.knownMoles / known.coefficient : 0;
  // Every substance from the one given amount: co-reactants are the REQUIRED amounts (coefficient ratio).
  const items: StoItem[] = terms.map((x) => {
    const moles = extent * x.coefficient;
    const mm = x.role === "known" ? result.knownMolarMass : x.role === "target" ? result.targetMolarMass : molarMassOf(x.formula);
    return { ...x, mass: moles * mm, moles };
  });
  const scene = { items, ratio: terms.map((x) => x.coefficient).join(" : ") };
  const equation = balancedText(terms);

  const steps = [
    { label: `${uniFormula(knownFormula)} (${knownUnitLabel})`, value: show(knownUnit === "grams" ? result.knownMoles * result.knownMolarMass : result.knownMoles) },
    { label: `${uniFormula(knownFormula)} (mol)`, value: show(result.knownMoles) },
    { label: `${uniFormula(targetFormula)} (mol)`, value: show(result.targetMoles) },
    { label: `${uniFormula(targetFormula)} (${unitLabel})`, value: show(result.targetAmount) },
  ];

  const share = valid ? (
    <StoichiometryShareExportModal
      operationLabel={`${knownFormula} → ${targetFormula}`}
      inputRows={[
        { label: t("knownMoles"), value: `${fmt(result.knownMoles)} ${molUnit}` },
        { label: t("knownMolarMass"), value: `${fmt(result.knownMolarMass)} g/mol` },
      ]}
      resultRows={[
        { label: t("targetMoles"), value: `${fmt(result.targetMoles)} ${molUnit}` },
        { label: t("targetMolarMass"), value: `${fmt(result.targetMolarMass)} g/mol` },
      ]}
      heroLabel={t("targetAmountCaption", { formula: targetFormula })}
      heroValue={heroValue}
      sentence={t("targetAmountCaption", { formula: targetFormula })}
    />
  ) : null;

  const dtClass = "text-xs font-semibold tracking-wide text-zinc-600 normal-case dark:text-zinc-300";
  const ddClass = "min-w-0 break-words font-semibold tabular-nums leading-snug text-zinc-800 text-[length:clamp(0.75rem,2.2vw,0.875rem)] dark:text-zinc-100";

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard
        id="sto-result"
        title={t("heading")}
        className="flex flex-col"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {share}
          </span>
        }
      >
        <StoichiometryResultScene p={scene} equation={equation} valid={valid} format={show} amount={knownAmount} unit={knownUnitLabel} seed={seedAmount} onSetAmount={onSetKnownAmount} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
        <div data-ph-result-values>
          {!hasCalculated ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <Calculator size={28} className="text-zinc-400 dark:text-zinc-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("emptyStateMessage")}</p>
            </div>
          ) : errorKey ? (
            <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(errorKey)}</p>
          ) : (
            <>
              <p dir="ltr" data-testid="sto-result-main" className="text-center text-[length:clamp(1.75rem,6vw,2.25rem)] font-bold tabular-nums text-blue-700 dark:text-blue-400">
                {show(result.targetAmount)} <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">{unitLabel}</span>
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                <RichText text={t("targetAmountCaption", { formula: uniFormula(targetFormula) })} />
              </p>
              <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
              <dl dir="ltr" data-ph-subvalues className="grid grid-cols-2 gap-x-2 gap-y-3 text-center text-sm sm:grid-cols-4">
                {steps.map((st, i) => (
                  <div key={i} className="min-w-0">
                    <dt className={dtClass}>
                      <RichText text={st.label} />
                    </dt>
                    <dd className={ddClass}>{st.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-center text-xs text-zinc-600 dark:text-zinc-300">{t("conversionPathCaption")}</p>
              <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
              <dl dir="ltr" className="grid grid-cols-2 gap-3 text-center text-sm">
                <div>
                  <dt className={dtClass}>{t("knownMolarMass")}</dt>
                  <dd className={ddClass}>{show(result.knownMolarMass)} g/mol</dd>
                </div>
                <div>
                  <dt className={dtClass}>{t("targetMolarMass")}</dt>
                  <dd className={ddClass}>{show(result.targetMolarMass)} g/mol</dd>
                </div>
              </dl>
            </>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
