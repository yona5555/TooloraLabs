"use client";
import { Calculator, Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { RichText } from "@/components/tool-ui/indicator-kit/CardKit";
import BalancerShareExportModal from "./BalancerShareExportModal";
import BalancerResultScene from "./BalancerResultScene";
import { atomLedger, balancedText, uniFormula } from "./chemMath";
import type { BalancerResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  digitStyle: DigitStyle;
  /** Index of the current equation among the rail's six reactions (−1 = the user's own equation). */
  reactionIndex: number;
  onSetReaction: (i: number) => void;
};

/**
 * §44: the Result card is the 3D card — the molecules-on-a-balance scene first, directly under the
 * header band, then the balanced equation, its terms and the atom ledger, all inside this one card.
 */
export default function BalancerResult({ hasCalculated, result, digitStyle, reactionIndex, onSetReaction }: Props) {
  const t = useTranslations("tools.chemical-equation-balancer.result");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const fmtInt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });
  const valid = hasCalculated && !result.error && result.terms.length > 0;
  const terms = valid ? result.terms : [];
  const errorKey =
    result.error === "empty-equation"
      ? "emptyEquation"
      : result.error === "invalid-equation"
        ? "invalidEquation"
        : result.error === "unknown-element"
          ? "unknownElement"
          : result.error === "cannot-balance"
            ? "cannotBalance"
            : null;

  const reactants = terms.filter((term) => term.side === "reactant");
  const products = terms.filter((term) => term.side === "product");
  const ledger = atomLedger(terms);
  const share = valid ? (
    <BalancerShareExportModal
      operationLabel={result.balancedEquation}
      inputRows={reactants.map((term) => ({ label: term.formula, value: `${fmtInt(term.coefficient)}×` }))}
      resultRows={products.map((term) => ({ label: term.formula, value: `${fmtInt(term.coefficient)}×` }))}
      heroLabel={t("heading")}
      heroValue={result.balancedEquation}
      sentence={t("balancedCaption")}
    />
  ) : null;

  const dtClass = "text-xs font-semibold tracking-wide text-zinc-600 normal-case dark:text-zinc-300";
  const ddClass = "text-xs font-semibold whitespace-nowrap tabular-nums text-zinc-800 sm:text-sm dark:text-zinc-100";
  const list = (items: typeof terms) => (
    <ul className="space-y-1 text-sm tabular-nums text-zinc-800 dark:text-zinc-100">
      {items.map((term) => (
        <li key={term.formula}>
          <RichText text={`${fmtInt(term.coefficient)} × ${uniFormula(term.formula)}`} />
        </li>
      ))}
    </ul>
  );

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard phoneRole="output"
        id="bal-result"
        title={t("heading")}
        className="flex flex-col lg:flex-1"
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
        <BalancerResultScene terms={terms} index={reactionIndex} onSetReaction={onSetReaction} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
        <div data-ph-result-values>
          {!hasCalculated ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <Calculator size={28} className="text-zinc-400 dark:text-zinc-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("emptyStateMessage")}</p>
            </div>
          ) : errorKey || !valid ? (
            <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(errorKey ?? "cannotBalance")}</p>
          ) : (
            <>
              <p dir="ltr" data-testid="bal-result-main" className="overflow-x-auto text-center text-2xl font-bold tabular-nums text-blue-700 sm:text-3xl dark:text-blue-400">
                <RichText text={balancedText(terms)} />
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">{t("balancedCaption")}</p>
              <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
              <div dir="ltr" className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`mb-1.5 ${dtClass}`}>{t("reactants")}</p>
                  {list(reactants)}
                </div>
                <div>
                  <p className={`mb-1.5 ${dtClass}`}>{t("products")}</p>
                  {list(products)}
                </div>
              </div>
              <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
              <p className={`mb-1.5 text-center ${dtClass}`}>{t("atomsTitle")}</p>
              <dl dir="ltr" data-ph-subvalues className="grid gap-3 text-center text-sm" style={{ gridTemplateColumns: `repeat(${Math.min(ledger.length, 4)}, minmax(0, 1fr))` }}>
                {ledger.map((row) => (
                  <div key={row.el}>
                    <dt className={dtClass}>{row.el}</dt>
                    <dd className={ddClass}>{`${fmtInt(row.l)} = ${fmtInt(row.r)}`}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
