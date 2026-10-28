"use client";
import type { SVGAttributes } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Line, MovablePoint, Polygon, Point, Text } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { tangentAt } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { LABEL_GAP, clampInto, padRange, placeBeside } from "@/components/tool-ui/chartLabels";
import { useLabelFit } from "@/components/tool-ui/useChartLabels";
import { useGraphLive } from "./GraphLiveContext";
import { MafsCurve, MAFS_COLORS, niceStep } from "./graphMafs";
import { fmtNum } from "./types";

const FLOAT = { "data-label-float": "" } as SVGAttributes<SVGTextElement>;

/**
 * Wow piece — Type #7 (Trend Line with Highlighted Reference Point): drag the red point along the
 * live curve; the tangent line, its slope triangle (rise over a fixed run) and the worked table
 * follow in real time. The dragged x is shared, so the Result drawing's tracing point moves too.
 */
export default function GraphTangentLab() {
  const t = useTranslations("tools.graphing-calculator.viz.tangentLab");
  const tv = useTranslations("tools.graphing-calculator.viz");
  const isDark = useIsDarkMode();
  const c = isDark ? MAFS_COLORS.dark : MAFS_COLORS.light;
  const { f, xMin, xMax, analysis: a, traceX, setTraceX } = useGraphLive();
  const yLo = a.viewYMin;
  const yHi = a.viewYMax;
  const tan = tangentAt(f, traceX);
  const run = (xMax - xMin) / 8;
  const clampX = (x: number) => Math.min(xMax, Math.max(xMin, x));
  const y0 = f(traceX);

  // Shared label layout: the view widens by the measured overflow of its own tick labels (no label cut at
  // the edges); the Δy label follows the drag, so it is kept inside by side choice and clamping instead.
  const [fitRef, fit] = useLabelFit(`${xMin}:${xMax}:${yLo}:${yHi}`);
  const [vx0, vx1] = padRange([xMin, xMax], fit.width, fit.margins.left, fit.margins.right);
  const [vy0, vy1] = padRange([yLo, yHi], fit.height, fit.margins.bottom, fit.margins.top);
  const riseLabel = tan ? `Δy=${fmtNum(tan.slope * run, 2)}` : "";
  const rise = (() => {
    if (!tan || !fit.width) return { attach: "e" as const, x: tan ? tan.x + run : 0, y: tan ? tan.y + (tan.slope * run) / 2 : 0 };
    const m = fit.measure(riseLabel, 12);
    const pxX = ((tan.x + run - vx0) / (vx1 - vx0)) * fit.width;
    const pxY = ((vy1 - (tan.y + (tan.slope * run) / 2)) / (vy1 - vy0)) * fit.height;
    const at = placeBeside(pxX, m.width, LABEL_GAP, fit.width - LABEL_GAP, "after");
    const x = vx0 + (at.at / fit.width) * (vx1 - vx0);
    const y = vy1 - (clampInto(pxY, m.ascent + m.descent + 2 * LABEL_GAP, 0, fit.height) / fit.height) * (vy1 - vy0);
    return { attach: at.side === "after" ? ("e" as const) : ("w" as const), x, y };
  })();

  const trend = !tan ? "" : Math.abs(tan.slope) < 1e-6 ? t("flat") : tan.slope > 0 ? t("rising") : t("falling");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <IndicatorWithTable
        className="mt-4"
        workedExampleTitle={tv("workedExample")}
        indicator={
          <div dir="ltr" className="w-[min(100%,460px)] lg:w-[460px]">
            <div ref={fitRef} role="group" aria-label={t("title")} className="mafs-canvas w-full overflow-hidden rounded-xl">
              <Mafs viewBox={{ x: [vx0, vx1], y: [vy0, vy1], padding: 0 }} height={300} pan={false} zoom={false} preserveAspectRatio={false}>
                <Coordinates.Cartesian xAxis={{ lines: niceStep(xMax - xMin) }} yAxis={{ lines: niceStep(yHi - yLo) }} />
                <MafsCurve f={f} xMin={xMin} xMax={xMax} yLo={yLo} yHi={yHi} color={c.curve} />
                {a.roots.map((r) => (
                  <Point key={r} x={r} y={0} color={c.muted} />
                ))}
                {tan && (
                  <>
                    <Line.PointSlope point={[tan.x, tan.y]} slope={tan.slope} color={c.tangent} weight={2} style="dashed" />
                    <Polygon
                      points={[
                        [tan.x, tan.y],
                        [tan.x + run, tan.y],
                        [tan.x + run, tan.y + tan.slope * run],
                      ]}
                      color={c.tangent}
                      fillOpacity={0.12}
                      weight={1}
                    />
                    <Text x={rise.x} y={rise.y} attach={rise.attach} attachDistance={LABEL_GAP} size={12} color={c.tangent} svgTextProps={FLOAT}>
                      {riseLabel}
                    </Text>
                  </>
                )}
                {y0 !== null && (
                  <MovablePoint
                    point={[traceX, y0]}
                    color={c.point}
                    constrain={([x]) => {
                      const cx = clampX(x);
                      return [cx, f(cx) ?? y0];
                    }}
                    onMove={([x]) => setTraceX(clampX(x))}
                  />
                )}
              </Mafs>
            </div>
            <p className="mt-1 text-center text-xs text-zinc-400 dark:text-zinc-500">{t("hint")}</p>
          </div>
        }
        rows={[
          { label: t("point"), value: tan ? `(${fmtNum(tan.x, 3)}, ${fmtNum(tan.y, 3)})` : "—" },
          { label: t("slope"), value: tan ? fmtNum(tan.slope, 4) : "—", emphasize: true, note: trend },
          { label: t("angle"), value: tan ? `${fmtNum(tan.angleDeg, 2)}°` : "—" },
          { label: t("riseRun"), value: tan ? `${fmtNum(tan.slope * run, 3)} / ${fmtNum(run, 3)}` : "—" },
          {
            label: t("tangent"),
            value: tan ? `y = ${fmtNum(tan.slope, 3)}x ${tan.intercept < 0 ? "−" : "+"} ${fmtNum(Math.abs(tan.intercept), 3)}` : "—",
          },
        ]}
      />
    </SectionCard>
  );
}
