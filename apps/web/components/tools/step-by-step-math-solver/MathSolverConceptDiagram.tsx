"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const W = 260;
const H = 180;
const AXIS_Y = 130;

function parabolaPath(a: number, vertexX: number, vertexY: number): string {
  const points: string[] = [];
  for (let px = 20; px <= W - 20; px += 4) {
    const x = (px - vertexX) / 18;
    const y = vertexY - a * x * x;
    points.push(`${px},${Math.max(10, Math.min(H - 20, y))}`);
  }
  return `M${points.join(" L")}`;
}

/**
 * Static, illustrative concept diagram — three example parabolas (not the user's live
 * inputs) showing what a quadratic equation's discriminant sign actually means
 * graphically: two x-axis crossings, one tangent touch, or none at all.
 */
export default function MathSolverConceptDiagram() {
  const d = useTranslations("tools.step-by-step-math-solver.aboveFold.conceptDiagram");

  const panels = [
    { path: parabolaPath(1.6, 130, 40), captionKey: "twoRoots", cx: 130 },
    { path: parabolaPath(1.6, 130, 100), captionKey: "oneRoot", cx: 130 },
    { path: parabolaPath(1.6, 130, 170), captionKey: "noRoots", cx: 130 },
  ] as const;

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {panels.map((panel, i) => (
          <div key={panel.captionKey} className="text-center">
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={d(`${panel.captionKey}AriaLabel`)} className="mx-auto block w-full max-w-[220px] text-current">
              <line x1={10} y1={AXIS_Y} x2={W - 10} y2={AXIS_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.3} />
              <path
                d={panel.path}
                fill="none"
                strokeWidth={2.5}
                className={i === 0 ? "stroke-emerald-600 dark:stroke-emerald-300" : i === 1 ? "stroke-amber-600 dark:stroke-amber-300" : "stroke-rose-600 dark:stroke-rose-300"}
              />
              {i === 0 && (
                <>
                  <circle cx={130 - 34} cy={AXIS_Y} r={4} className="fill-emerald-600 dark:fill-emerald-300" />
                  <circle cx={130 + 34} cy={AXIS_Y} r={4} className="fill-emerald-600 dark:fill-emerald-300" />
                </>
              )}
              {i === 1 && <circle cx={130} cy={AXIS_Y} r={4} className="fill-amber-600 dark:fill-amber-300" />}
            </svg>
            <p className="mt-1 text-xs font-semibold" dir="auto">
              {d(`${panel.captionKey}Label`)}
            </p>
            <p className="text-xs opacity-60" dir="auto">
              {d(`${panel.captionKey}Caption`)}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
