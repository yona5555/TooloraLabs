"use client";
import { Calculator, Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { RichText } from "@/components/tool-ui/indicator-kit/CardKit";
import { uniFormula } from "../chemical-equation-balancer/chemMath";
import MolarMassShareExportModal from "./MolarMassShareExportModal";
import MolarMassResultScene from "./MolarMassResultScene";
import { partsOf, RAIL, RAIL_SEED } from "./mmMath";
import type { MolarMassResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  formula: string;
  digitStyle: DigitStyle;
  onSetFormula: (formula: string) => void;
};

/**
 * §44: the Result card is the 3D card — the molecule + mass-share scene first, directly under the
 * header band, then the molar mass and the element breakdown table, all in this one card.
 */
export default function MolarMassResult({ hasCalculated, result, formula, digitStyle, onSetFormula }: Props) {
  const t = useTranslations("tools.molar-mass-calculator.result");
  const tForm = useTranslations("tools.molar-mass-calculator.form");
  const th = useTranslations("tools.molar-mass-calculator.visuals.hero");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });
  const fmtInt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });
  const valid = hasCalculated && !result.error && result.totalMass > 0;
  const messageKey =
    result.error === "empty-formula"
      ? "emptyFormula"
      : result.error === "unknown-element"
        ? "unknownElement"
        : result.error === "unbalanced-parentheses"
          ? "unbalancedParentheses"
          : "invalidFormula";

  const heroValue = `${fmt(result.totalMass)} g/mol`;
  const resultRows = result.breakdown.map((row) => ({ label: row.symbol, value: `${fmtInt(row.count)} × ${fmt(row.atomicMass)} = ${fmt(row.subtotal)}` }));
  // Without a valid result the scene keeps the default compound, so the card never shows an empty box.
  const sceneFormula = valid ? formula : RAIL[RAIL_SEED].formula;
  const sp = partsOf(sceneFormula);
  const parts = sp?.parts ?? [];
  const scene = {
    formula: sceneFormula,
    parts,
    totalText: `${Number((sp?.total ?? 0).toFixed(3))} g/mol`,
    formulaLabel: uniFormula(sceneFormula),
    atomsText: th("atoms", { n: parts.reduce((a, b) => a + b.count, 0) }),
    drawMolecule: true,
  };

  const share = valid ? (
    <MolarMassShareExportModal
      operationLabel={formula}
      inputRows={[{ label: tForm("formulaLabel"), value: formula }]}
      resultRows={resultRows}
      heroLabel={t("totalMass")}
      heroValue={heroValue}
      sentence={`${t("totalMass")}: ${heroValue}`}
    />
  ) : null;

  const th3 = "px-2 py-2 text-start font-bold";
  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard
        id="mm-result"
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
        <MolarMassResultScene p={scene} mm={sp?.total ?? 0} onSetFormula={onSetFormula} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
        <div data-ph-result-values>
          {!hasCalculated ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <Calculator size={28} className="text-zinc-400 dark:text-zinc-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("emptyStateMessage")}</p>
            </div>
          ) : !valid ? (
            <>
              <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
              {result.errorDetail && (
                <p dir="ltr" className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  {result.errorDetail}
                </p>
              )}
            </>
          ) : (
            <>
              <p dir="ltr" data-testid="mm-result-main" className="text-center text-4xl font-bold tabular-nums text-blue-700 dark:text-blue-400">
                {fmt(result.totalMass)} <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">g/mol</span>
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {t("totalMass")} · <RichText text={uniFormula(formula)} />
              </p>
              <div dir="ltr" className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm tabular-nums" data-ph-table>
                  <thead>
                    <tr style={{ background: "var(--glass-table-header-bg)", color: "var(--ph-ink)" }}>
                      <th className={`${th3} rounded-s-lg`}>{t("columnElement")}</th>
                      <th className={th3}>{t("columnCount")}</th>
                      <th className={th3}>{t("columnAtomicMass")}</th>
                      <th className={`${th3} rounded-e-lg`}>{t("columnSubtotal")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((row) => (
                      <tr key={row.symbol} style={{ borderBottom: "1px solid var(--glass-table-row-border)", color: "var(--ph-ink)" }}>
                        <td className="px-2 py-1.5 font-bold">{row.symbol}</td>
                        <td className="px-2 py-1.5">{fmtInt(row.count)}</td>
                        <td className="px-2 py-1.5">{fmt(row.atomicMass)}</td>
                        <td className="px-2 py-1.5 font-semibold">{fmt(row.subtotal)}</td>
                      </tr>
                    ))}
                    <tr data-key-row style={{ background: "var(--glass-key-row-bg)", color: "var(--ph-ink)" }}>
                      <td className="px-2 py-1.5 font-bold" colSpan={3}>
                        {t("totalMass")}
                      </td>
                      <td className="px-2 py-1.5 font-extrabold">{`${fmt(result.totalMass)} g/mol`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
