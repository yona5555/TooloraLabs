"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, solveQuadraticRoots, vietaFromQuadratic, fmt } from "./mathSolverEducationMath";

/** Laws card: the real formulas behind the active mode's own solve, each with the live
 * coefficients substituted in — a draggable slider steps through which law is expanded. */
export default function LawsCard() {
  const t = useTranslations("tools.step-by-step-math-solver.education.lawsCard");
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);
  const isQuadratic = dims.mode === "quadratic-equation" || (dims.mode === "derivative" && eq.degree === 2);

  const laws = isQuadratic
    ? [
        { key: "discriminant", formula: "D = b² - 4ac", substituted: `D = (${fmt(eq.coeffs[1])})² - 4(${fmt(eq.coeffs[2])})(${fmt(eq.coeffs[0])}) = ${fmt(solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]).discriminant)}` },
        { key: "quadraticFormula", formula: "x = (-b ± √D) / 2a", substituted: (() => {
            const r = solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
            return r.kind === "complex" ? `x = ${fmt(r.re)} ± ${fmt(Math.abs(r.im))}i` : r.kind === "two-real" ? `x = ${fmt(r.x1)}, ${fmt(r.x2)}` : `x = ${fmt(r.x)}`;
          })() },
        { key: "vieta", formula: "x₁+x₂ = -b/a,  x₁·x₂ = c/a", substituted: (() => {
            const v = vietaFromQuadratic(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
            return `${fmt(v.sum)}, ${fmt(v.product)}`;
          })() },
      ]
    : [
        { key: "slope", formula: "x = -c₀/c₁", substituted: `x = ${fmt(-eq.coeffs[0])}/${fmt(eq.coeffs[1])} = ${fmt(-eq.coeffs[0] / (eq.coeffs[1] || 1))}` },
      ];

  const [idx, setIdx] = useState(0);
  const clampedIdx = Math.min(idx, laws.length - 1);
  const active = laws[clampedIdx];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
            <p className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">{active.formula}</p>
            <p className="mt-2 font-mono text-xs text-zinc-600 dark:text-zinc-300">{active.substituted}</p>
          </div>
          {laws.length > 1 && (
            <input
              type="range"
              min={0}
              max={laws.length - 1}
              value={clampedIdx}
              onChange={(e) => setIdx(parseInt(e.target.value, 10))}
              className="mt-3 w-full accent-blue-600 dark:accent-blue-400"
              aria-label={t("selectorAria")}
            />
          )}
          <p className="mt-1 text-center text-xs text-zinc-400 dark:text-zinc-500">{t(`laws.${active.key}`)}</p>
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t(`laws.${active.key}`), value: active.substituted, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
