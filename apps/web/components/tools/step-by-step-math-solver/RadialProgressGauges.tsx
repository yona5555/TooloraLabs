"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, evalPoly, fmt } from "./mathSolverEducationMath";

const R = 26;
const CIRC = 2 * Math.PI * R;

function Gauge({ pct, label, value, color }: { pct: number; label: string; value: string; color: string }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={R} fill="none" stroke="currentColor" className="text-zinc-200 dark:text-zinc-700" strokeWidth="6" />
        <circle
          cx="34"
          cy="34"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - clamped)}
          strokeLinecap="round"
          transform="rotate(-90 34 34)"
          className="transition-all duration-300"
        />
        <text x="34" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" className="text-zinc-700 dark:text-zinc-200">
          {value}
        </text>
      </svg>
      <span className="text-center text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{label}</span>
    </div>
  );
}

/** Radial progress gauges: the live solve's own progress through its 4 stations, its term count
 * and degree normalized to a ring, and — via the one draggable slider — how close a probed x sits
 * to being an actual root (full ring exactly at a real root). */
export default function RadialProgressGauges() {
  const t = useTranslations("tools.step-by-step-math-solver.education.progressGauges");
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);
  const step = dims.selectedStep ?? 3;
  const [testX, setTestX] = useState(0);

  const termCount = eq.coeffs.filter((c) => c !== 0).length;
  const degreePct = Math.min(1, eq.degree / 4);
  const remainder = Math.abs(evalPoly(eq.coeffs, testX));
  const remainderPct = 1 / (1 + remainder);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Gauge pct={(step + 1) / 4} label={t("progressLabel")} value={`${step + 1}/4`} color="#2563eb" />
            <Gauge pct={termCount / Math.max(1, eq.coeffs.length)} label={t("termsLabel")} value={`${termCount}`} color="#16a34a" />
            <Gauge pct={degreePct} label={t("degreeLabel")} value={`${eq.degree}`} color="#9333ea" />
            <Gauge pct={remainderPct} label={t("remainderLabel")} value={fmt(remainder)} color="#dc2626" />
          </div>
          <label className="flex w-full max-w-[220px] flex-col items-center gap-1">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t("probeLabel", { x: fmt(testX) })}</span>
            <input type="range" min={-10} max={10} step={0.1} value={testX} onChange={(e) => setTestX(parseFloat(e.target.value))} className="w-full accent-red-600 dark:accent-red-400" aria-label={t("probeAria")} />
          </label>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.probeX"), value: fmt(testX) },
            { label: t("worked.remainder"), value: fmt(remainder), emphasize: true, note: remainder < 0.05 ? t("worked.nearRoot") : undefined },
          ]}
        />
      </div>
    </SectionCard>
  );
}
