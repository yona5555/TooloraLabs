"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Point, Text } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, computeSurfaceAreaFor, round } from "./surfaceAreaEducationMath";

const LIGHT = { curve: "#2563eb", point: "#dc2626" };
const DARK = { curve: "#60a5fa", point: "#f87171" };

/** Type #7 (Trend Line with Highlighted Reference Point): the live solid's surface area as every one of its own dimensions is scaled together, plotted as a continuous curve — surface area always grows with the SQUARE of the scale factor, never linearly, with the real current point marked on it. */
export default function SurfaceAreaVsScaleFactorCurve() {
  const t = useTranslations("tools.surface-area-calculator.education.scaleCurve");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const baseArea = computeSurfaceAreaFor(n);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: [0.4, 2.1], y: [0, baseArea * 4.3] }} height={200} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 0.25, labels: (x) => `${x}×` }} yAxis={{ lines: Math.max(1, Math.round((baseArea * 4) / 5)) }} />
              <Plot.OfX y={(factor) => baseArea * factor * factor} domain={[0.5, 2]} color={colors.curve} weight={2.5} />
              <Point x={1} y={baseArea} color={colors.point} svgCircleProps={{ r: 5 }} />
              <Text x={1} y={baseArea} attach="n" attachDistance={12} color={colors.point} size={12}>
                {`${round(baseArea)}`}
              </Text>
            </Mafs>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.half"), value: `${round(baseArea * 0.25)}` },
            { label: t("worked.current"), value: `${round(baseArea)}` },
            { label: t("worked.double"), value: `${round(baseArea * 4)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
