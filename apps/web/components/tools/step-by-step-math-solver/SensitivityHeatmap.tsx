"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Point, Polygon, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, solveQuadraticRoots, fmt, snapDragValue } from "./mathSolverEducationMath";

const GRID = 14;
const RANGE = 10;

/** Sensitivity heatmap: every (b, c) pair's own discriminant sign, painted as a real grid — the
 * live equation's own (b, c) is a draggable point on top of it, so dragging it visibly crosses
 * real zone boundaries between two-real, repeated, and complex roots. Quadratic-specific (the
 * only mode with a 2-parameter root-type map); other modes show their own 1-parameter analog. */
export default function SensitivityHeatmap() {
  const t = useTranslations("tools.step-by-step-math-solver.education.sensitivityHeatmap");
  const { dims, setDim } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const isQuadratic = dims.mode === "quadratic-equation";
  const a = isQuadratic ? n.quadA || 1 : 1;

  const cells: { b: number; c: number; kind: string }[] = [];
  if (isQuadratic) {
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const b = -RANGE + (2 * RANGE * i) / (GRID - 1);
        const c = -RANGE + (2 * RANGE * j) / (GRID - 1);
        const r = solveQuadraticRoots(c, b, a);
        cells.push({ b, c, kind: r.kind });
      }
    }
  }

  const point = useMovablePoint([n.quadB ?? -4, n.quadC ?? -6], {
    constrain: (p) => [Math.max(-RANGE, Math.min(RANGE, p[0])), Math.max(-RANGE, Math.min(RANGE, p[1]))],
    color: "#111827",
  });

  function handleRelease() {
    if (!isQuadratic) return;
    setDim("quadB", `${snapDragValue(point.point[0])}`);
    setDim("quadC", `${snapDragValue(point.point[1])}`);
  }

  const cellSize = (2 * RANGE) / GRID;
  const colorFor = (kind: string) => (kind === "two-real" ? "#16a34a" : kind === "one-real" ? "#ca8a04" : "#dc2626");

  const currentKind = isQuadratic ? solveQuadraticRoots(n.quadC ?? -6, n.quadB ?? -4, a).kind : "n/a";

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          {isQuadratic ? (
            <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[340px] overflow-hidden rounded-xl" onMouseUp={handleRelease} onTouchEnd={handleRelease}>
              <Mafs viewBox={{ x: [-RANGE, RANGE], y: [-RANGE, RANGE] }} height={240} pan={false} zoom={false} preserveAspectRatio={false}>
                <Coordinates.Cartesian xAxis={{ lines: 5 }} yAxis={{ lines: 5 }} />
                {cells.map((cell, i) => (
                  <Polygon
                    key={i}
                    points={[
                      [cell.b - cellSize / 2, cell.c - cellSize / 2],
                      [cell.b + cellSize / 2, cell.c - cellSize / 2],
                      [cell.b + cellSize / 2, cell.c + cellSize / 2],
                      [cell.b - cellSize / 2, cell.c + cellSize / 2],
                    ]}
                    color={colorFor(cell.kind)}
                    fillOpacity={0.3}
                    strokeOpacity={0}
                  />
                ))}
                <Point x={n.quadB ?? -4} y={n.quadC ?? -6} color="#111827" svgCircleProps={{ r: 4 }} />
                {point.element}
              </Mafs>
            </div>
          ) : (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400">
              {t("notApplicableNonQuadratic")}
            </p>
          )}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.bc"), value: `b=${fmt(n.quadB ?? 0)}, c=${fmt(n.quadC ?? 0)}` },
            { label: t("worked.zone"), value: isQuadratic ? t(`zones.${currentKind}`) : "—", emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
