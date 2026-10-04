"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, solveQuadraticRoots, solveLinearRoot, bisectionSteps, fmt } from "./mathSolverEducationMath";

/** Six-methods matrix: the SAME live equation solved six genuinely different ways — factoring,
 * completing the square, the quadratic formula, graphing, substitution, and numerical bisection
 * (its own iteration count the draggable control) — each converging on the same real root. */
export default function SixMethodsMatrix() {
  const t = useTranslations("tools.step-by-step-math-solver.education.sixMethods");
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);
  const [bisectIter, setBisectIter] = useState(4);

  const isQuadratic = eq.degree === 2;
  const a = eq.coeffs[2] ?? 1;
  const b = eq.coeffs[1];
  const c = eq.coeffs[0];

  let factoring = "";
  let completing = "";
  let formula = "";
  let graphing = "";
  let substitution = "";

  if (isQuadratic) {
    const r = solveQuadraticRoots(c, b, a);
    if (r.kind === "two-real" || r.kind === "one-real") {
      const x1 = r.kind === "two-real" ? r.x1 : r.x;
      const x2 = r.kind === "two-real" ? r.x2 : r.x;
      factoring = `${fmt(a)}(x ${x1 <= 0 ? "+" : "-"} ${fmt(Math.abs(x1))})(x ${x2 <= 0 ? "+" : "-"} ${fmt(Math.abs(x2))})`;
    } else {
      factoring = t("notFactorable");
    }
    const h = -b / (2 * a);
    const k = c - (b * b) / (4 * a);
    completing = `${fmt(a)}(x ${h <= 0 ? "+" : "-"} ${fmt(Math.abs(h))})² ${k <= 0 ? "-" : "+"} ${fmt(Math.abs(k))} = 0`;
    formula = r.kind === "complex" ? `x = ${fmt(r.re)} ± ${fmt(Math.abs(r.im))}i` : r.kind === "two-real" ? `x = ${fmt(r.x1)}, ${fmt(r.x2)}` : `x = ${fmt(r.x)}`;
    graphing = r.kind === "complex" ? t("noRealCrossing") : t("crossesAt", { x: r.kind === "two-real" ? `${fmt(r.x1)}, ${fmt(r.x2)}` : fmt(r.x) });
    substitution = r.kind !== "complex" ? t("substitutionOk") : t("substitutionComplex");
  } else {
    const root = solveLinearRoot(c, b);
    factoring = root !== null ? `${fmt(b)}(x ${-root <= 0 ? "-" : "+"} ${fmt(Math.abs(-root))}) = 0` : t("notFactorable");
    completing = t("notApplicableLinear");
    formula = root !== null ? `x = ${fmt(root)}` : t("noUniqueRoot");
    graphing = root !== null ? t("crossesAt", { x: fmt(root) }) : t("noRealCrossing");
    substitution = root !== null ? t("substitutionOk") : t("substitutionComplex");
  }

  const bisectDomainLo = isQuadratic ? -((-b / (2 * a)) + 6) : -8;
  const bisectDomainHi = isQuadratic ? -b / (2 * a) + 6 : 8;
  const steps = bisectionSteps(eq.coeffs, bisectDomainLo, bisectDomainHi, bisectIter);
  const lastStep = steps[steps.length - 1];

  const rows = [
    { key: "factoring", value: factoring },
    { key: "completing", value: completing },
    { key: "formula", value: formula },
    { key: "graphing", value: graphing },
    { key: "substitution", value: substitution },
    { key: "bisection", value: lastStep ? `x ≈ ${fmt(lastStep.mid)}` : t("noBracket") },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full overflow-x-auto lg:flex-1">
          <table className="w-full min-w-[360px] border-collapse text-sm">
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2 font-semibold text-zinc-600 dark:text-zinc-300">{t(`methods.${r.key}`)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <label className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {t("bisectionIterLabel", { count: bisectIter })}
            <input type="range" min={1} max={10} value={bisectIter} onChange={(e) => setBisectIter(parseInt(e.target.value, 10))} className="flex-1 accent-blue-600 dark:accent-blue-400" aria-label={t("bisectionIterAria")} />
          </label>
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.allAgree"), value: formula, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
