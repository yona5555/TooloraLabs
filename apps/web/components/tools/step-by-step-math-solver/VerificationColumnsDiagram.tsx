"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, solveQuadraticRoots, solveLinearRoot, evalPoly, fmt } from "./mathSolverEducationMath";

/** Verification columns: LHS vs RHS evaluated at a live, draggable test x — two bars that match
 * heights exactly at a real root and visibly diverge (a third "remainder" bar grows) everywhere
 * else, making substitution-checking a felt, not just read, idea. */
export default function VerificationColumnsDiagram() {
  const t = useTranslations("tools.step-by-step-math-solver.education.verificationColumns");
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);

  let root: number | null = null;
  if (dims.mode === "quadratic-equation" || (dims.mode === "derivative" && eq.degree === 2)) {
    const r = solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
    root = r.kind === "two-real" ? r.x1 : r.kind === "one-real" ? r.x : r.re;
  } else {
    root = solveLinearRoot(eq.coeffs[0], eq.coeffs[1]);
  }

  const [testX, setTestX] = useState<number | null>(null);
  const x = testX ?? root ?? 0;

  let lhs = 0;
  let rhs = 0;
  if (dims.mode === "linear-equation") {
    lhs = (n.linearA ?? 0) * x + (n.linearB ?? 0);
    rhs = (n.linearC ?? 0) * x + (n.linearD ?? 0);
  } else if (dims.mode === "quadratic-equation") {
    lhs = (n.quadA ?? 1) * x * x + (n.quadB ?? 0) * x;
    rhs = -(n.quadC ?? 0);
  } else if (dims.mode === "fraction-operation") {
    lhs = -eq.coeffs[0];
    rhs = x;
  } else {
    lhs = evalPoly(eq.coeffs, x);
    rhs = 0;
  }
  const remainder = Math.abs(lhs - rhs);
  const maxH = Math.max(Math.abs(lhs), Math.abs(rhs), remainder, 1);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end">
        <div dir="ltr" className="flex shrink-0 flex-col items-center gap-3">
          <div className="flex items-end justify-center gap-3" style={{ height: "110px" }}>
            {[
              { label: "LHS", value: lhs, color: "bg-blue-500" },
              { label: "RHS", value: rhs, color: "bg-red-500" },
              { label: t("remainderLabel"), value: remainder, color: "bg-amber-500" },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-1">
                <div className={`w-10 rounded-t-md ${bar.color} transition-all duration-200`} style={{ height: `${Math.max(4, (Math.abs(bar.value) / maxH) * 90)}px` }} />
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{bar.label}</span>
                <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-200">{fmt(bar.value)}</span>
              </div>
            ))}
          </div>
          <label className="flex w-full max-w-[200px] flex-col items-center gap-1">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t("testXLabel", { x: fmt(x) })}</span>
            <input type="range" min={-10} max={10} step={0.1} value={x} onChange={(e) => setTestX(parseFloat(e.target.value))} className="w-full accent-amber-600 dark:accent-amber-400" aria-label={t("testXAria")} />
          </label>
          {root !== null && (
            <button type="button" onClick={() => setTestX(root)} className="rounded-full border border-dashed border-zinc-300 px-3 py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800">
              {t("jumpToRoot")}
            </button>
          )}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.testX"), value: fmt(x) },
            { label: t("worked.remainder"), value: fmt(remainder), emphasize: true, note: remainder < 0.05 ? t("worked.verified") : undefined },
          ]}
        />
      </div>
    </SectionCard>
  );
}
