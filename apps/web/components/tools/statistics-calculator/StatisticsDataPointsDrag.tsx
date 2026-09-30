"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { StatisticsCalculator } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { MafsHoverSegment, MafsHoverPoint } from "@/components/tool-ui/MafsHoverPrimitives";

type Vector2 = [number, number];

const tool = new StatisticsCalculator();
const MIN_X = 0;
const MAX_X = 20;
const LIGHT = { blue: "#2563eb", green: "#16a34a", amber: "#d97706" };
const DARK = { blue: "#60a5fa", green: "#4ade80", amber: "#fbbf24" };
const INITIAL = [4, 7, 9, 11, 13, 17];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * The hero indicator (§36): drag any of six data points along a shared number line and the
 * mean, median, and standard deviation all recompute live via the real StatisticsCalculator
 * engine — the exact "drag data points, watch mean/median/deviation move" interaction the
 * category calls for, since this tool's own core computation IS a data set.
 */
export default function StatisticsDataPointsDrag() {
  const t = useTranslations("tools.statistics-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  const constrain = (p: Vector2): Vector2 => [Math.min(MAX_X, Math.max(MIN_X, p[0])), 0];

  const p1 = useMovablePoint([INITIAL[0], 0] as Vector2, { color: colors.blue, constrain });
  const p2 = useMovablePoint([INITIAL[1], 0] as Vector2, { color: colors.blue, constrain });
  const p3 = useMovablePoint([INITIAL[2], 0] as Vector2, { color: colors.blue, constrain });
  const p4 = useMovablePoint([INITIAL[3], 0] as Vector2, { color: colors.blue, constrain });
  const p5 = useMovablePoint([INITIAL[4], 0] as Vector2, { color: colors.blue, constrain });
  const p6 = useMovablePoint([INITIAL[5], 0] as Vector2, { color: colors.blue, constrain });
  const points = [p1, p2, p3, p4, p5, p6];
  const values = points.map((p) => round2(p.point[0]));

  const output = tool.execute({ values }, { locale: "en-US" });
  const data = output.success ? output.data : null;

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${t("meanLabel")}: ${data ? round2(data.mean) : "—"}`}</span>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">{`${t("medianLabel")}: ${data ? round2(data.median) : "—"}`}</span>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">{`${t("stdDevLabel")}: ${data ? round2(data.populationStdDev) : "—"}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [MIN_X - 1, MAX_X + 1], y: [-1.6, 1.2] }} height={210} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 2 }} yAxis={{ lines: false, axis: false }} />

          {data && (
            <>
              <Polygon
                points={[
                  [data.mean - data.populationStdDev, -0.05],
                  [data.mean + data.populationStdDev, -0.05],
                  [data.mean + data.populationStdDev, 0.05],
                  [data.mean - data.populationStdDev, 0.05],
                ]}
                color={colors.green}
                fillOpacity={0.18}
                strokeOpacity={0}
              />
              <MafsHoverSegment
                point1={[data.mean, -1.1]}
                point2={[data.mean, -0.6]}
                color={colors.blue}
                weight={2.5}
                tooltip={t("meanTooltip", { value: `${round2(data.mean)}` })}
              />
              <Text x={data.mean} y={-1.3} size={11} color={colors.blue}>
                {`${t("meanShort")} ${round2(data.mean)}`}
              </Text>

              <MafsHoverSegment
                point1={[data.median, 0.5]}
                point2={[data.median, 1]}
                color={colors.amber}
                weight={2.5}
                dashed
                tooltip={t("medianTooltip", { value: `${round2(data.median)}` })}
              />
              <Text x={data.median} y={1.2} size={11} color={colors.amber}>
                {`${t("medianShort")} ${round2(data.median)}`}
              </Text>

              <MafsHoverPoint point={[data.mean, 0]} tooltip={t("stdDevTooltip", { value: `${round2(data.populationStdDev)}` })} radiusPx={14} />
            </>
          )}

          {points.map((p, i) => (
            <MafsHoverPoint key={i} point={p.point} tooltip={t("pointTooltip", { value: `${round2(p.point[0])}` })} radiusPx={12} />
          ))}
          {points.map((p, i) => (
            <g key={`el-${i}`}>{p.element}</g>
          ))}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
