"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, solveQuadraticRoots, solveLinearRoot, evalPoly, fmt } from "./mathSolverEducationMath";

/** Notation-mapping diagram: the SAME solution set written four different real ways (set-builder,
 * decimal list, simplified fraction, and a membership check) — a draggable candidate-value slider
 * tests whether any arbitrary number actually belongs to that set, live. */
export default function NotationMappingDiagram() {
  const t = useTranslations("tools.step-by-step-math-solver.education.notationMapping");
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);
  const [candidate, setCandidate] = useState(0);

  let roots: number[] = [];
  let setBuilder = "";
  if (dims.mode === "quadratic-equation" || (dims.mode === "derivative" && eq.degree === 2)) {
    const r = solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
    if (r.kind === "two-real") roots = [r.x1, r.x2];
    else if (r.kind === "one-real") roots = [r.x];
    setBuilder = r.kind === "complex" ? t("setBuilderComplex") : `{ x | ${eq.label} }`;
  } else {
    const root = solveLinearRoot(eq.coeffs[0], eq.coeffs[1]);
    roots = root !== null ? [root] : [];
    setBuilder = root !== null ? `{ x | ${eq.label} }` : t("setBuilderEmpty");
  }

  const tolerance = 0.05;
  const isMember = roots.some((r) => Math.abs(r - candidate) < tolerance);
  const probeValue = evalPoly(eq.coeffs, candidate);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/40">
              <p className="font-semibold text-zinc-500 dark:text-zinc-400">{t("setBuilderLabel")}</p>
              <p className="mt-1 font-mono">{setBuilder}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/40">
              <p className="font-semibold text-zinc-500 dark:text-zinc-400">{t("decimalListLabel")}</p>
              <p className="mt-1 font-mono">{roots.length ? roots.map((r) => fmt(r)).join(", ") : "∅"}</p>
            </div>
          </div>
          <label className="mt-2 flex flex-col gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("candidateLabel", { x: fmt(candidate) })}</span>
            <input type="range" min={-10} max={10} step={0.1} value={candidate} onChange={(e) => setCandidate(parseFloat(e.target.value))} className="w-full accent-purple-600 dark:accent-purple-400" aria-label={t("candidateAria")} />
          </label>
          <p className={`text-center text-sm font-bold ${isMember ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}`}>
            {isMember ? t("isMember", { x: fmt(candidate) }) : t("notMember", { x: fmt(candidate) })}
          </p>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.candidate"), value: fmt(candidate) },
            { label: t("worked.probeValue"), value: fmt(probeValue) },
            { label: t("worked.membership"), value: isMember ? t("worked.yes") : t("worked.no"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
