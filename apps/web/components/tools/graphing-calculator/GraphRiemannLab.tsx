"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { riemannSum, type RiemannMethod } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { useGraphLive } from "./GraphLiveContext";
import { MafsCurve, MAFS_COLORS, niceStep } from "./graphMafs";
import { fmtNum } from "./types";

const METHODS: Exclude<RiemannMethod, "simpson">[] = ["left", "midpoint", "right", "trapezoid"];

/**
 * Type #13 (Stepped Diagram), interactive: the live curve's area cut into n strips; a slider sets n
 * and buttons pick the rule. The worked table compares the strip sum with a 1000-strip Simpson value.
 */
export default function GraphRiemannLab() {
  const t = useTranslations("tools.graphing-calculator.viz.riemann");
  const tv = useTranslations("tools.graphing-calculator.viz");
  const isDark = useIsDarkMode();
  const c = isDark ? MAFS_COLORS.dark : MAFS_COLORS.light;
  const { f, xMin, xMax, analysis: a } = useGraphLive();
  const [n, setN] = useState(8);
  const [method, setMethod] = useState<(typeof METHODS)[number]>("midpoint");
  const yLo = Math.min(a.viewYMin, 0);
  const yHi = Math.max(a.viewYMax, 0);
  const w = (xMax - xMin) / n;
  // Float noise (e.g. 1e-16 for an odd function on a symmetric range) reads as 0.
  const tidy = (v: number) => (Math.abs(v) < 1e-9 * Math.max(1, Math.abs(a.viewYMax), Math.abs(a.viewYMin)) ? 0 : v);
  const approx = tidy(riemannSum(f, xMin, xMax, n, method));
  const exact = tidy(riemannSum(f, xMin, xMax, 1000, "simpson"));
  const err = tidy(Math.abs(approx - exact));
  const clampY = (y: number) => Math.min(yHi, Math.max(yLo, y));

  const strips = Array.from({ length: n }, (_, i) => {
    const x0 = xMin + i * w;
    const x1 = x0 + w;
    const v0 = f(x0) ?? 0;
    const v1 = f(x1) ?? 0;
    if (method === "trapezoid") return { pts: [[x0, 0], [x0, clampY(v0)], [x1, clampY(v1)], [x1, 0]] as [number, number][], h: (v0 + v1) / 2 };
    const h = method === "left" ? v0 : method === "right" ? v1 : f((x0 + x1) / 2) ?? 0;
    return { pts: [[x0, 0], [x0, clampY(h)], [x1, clampY(h)], [x1, 0]] as [number, number][], h };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <IndicatorWithTable
        className="mt-4"
        workedExampleTitle={tv("workedExample")}
        indicator={
          <div className="w-[min(100%,460px)] lg:w-[460px]">
            <div className="mb-2 flex flex-wrap gap-1">
              {METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={m === method}
                  onClick={() => setMethod(m)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    m === method ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {t(m)}
                </button>
              ))}
            </div>
            <div dir="ltr" className="mafs-canvas w-full overflow-hidden rounded-xl">
              <Mafs viewBox={{ x: [xMin, xMax], y: [yLo, yHi], padding: 0 }} height={260} pan={false} zoom={false} preserveAspectRatio={false}>
                <Coordinates.Cartesian xAxis={{ lines: niceStep(xMax - xMin) }} yAxis={{ lines: niceStep(yHi - yLo) }} />
                {strips.map((s, i) => (
                  <Polygon key={i} points={s.pts} color={s.h >= 0 ? c.fill : c.neg} fillOpacity={0.25} weight={1} />
                ))}
                <MafsCurve f={f} xMin={xMin} xMax={xMax} yLo={yLo} yHi={yHi} color={c.curve} />
              </Mafs>
            </div>
            <label className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="whitespace-nowrap">{t("strips")}</span>
              <input type="range" dir="ltr" min={2} max={40} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-blue-600" />
              <span dir="ltr" className="w-8 text-end font-mono font-semibold text-zinc-700 dark:text-zinc-200">
                {n}
              </span>
            </label>
          </div>
        }
        rows={[
          { label: t("width"), value: `Δx = ${fmtNum(w, 4)}` },
          { label: t("approx"), value: fmtNum(approx, 5), note: `${t(method)} · n = ${n}` },
          { label: t("reference"), value: fmtNum(exact, 5) },
          { label: t("error"), value: fmtNum(err, 5), emphasize: true, note: exact !== 0 ? `${fmtNum((err / Math.abs(exact)) * 100, 2)}%` : undefined },
        ]}
      />
    </SectionCard>
  );
}
