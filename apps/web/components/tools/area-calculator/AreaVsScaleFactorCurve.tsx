"use client";
import { useTranslations } from "next-intl";
import { Coordinates, Plot, Point, Text } from "mafs";
import FitMafs from "@/components/tool-ui/FitMafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, computeAreaFor, round } from "./areaEducationMath";
import GapFreeRow from "@/components/tool-ui/GapFreeRow";

const LIGHT = { curve: "#2563eb", point: "#dc2626" };
const DARK = { curve: "#60a5fa", point: "#f87171" };

/** Type #7 (Trend Line with Highlighted Reference Point): the live shape's area as every one of its own dimensions is scaled together, plotted as a continuous curve — area always grows with the SQUARE of the scale factor, never linearly, with the real current point marked on it. */
export default function AreaVsScaleFactorCurve() {
  const t = useTranslations("tools.area-calculator.education.scaleCurve");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const baseArea = computeAreaFor(n);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <GapFreeRow className="mt-4">
        <div dir="ltr" className="w-full lg:flex-1">
          <PhoneMini slot={1} title={t("title")}>
          <div role="group" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
            <FitMafs viewBox={{ x: [0.4, 2.1], y: [0, baseArea * 4.3] }} height={200} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 0.25, labels: (x) => `${x}×` }} yAxis={{ lines: Math.max(1, Math.round((baseArea * 4) / 5)) }} />
              <Plot.OfX y={(factor) => baseArea * factor * factor} domain={[0.5, 2]} color={colors.curve} weight={2.5} />
              <Point x={1} y={baseArea} color={colors.point} svgCircleProps={{ r: 5 }} />
              <Text x={1} y={baseArea} attach="n" attachDistance={12} color={colors.point} size={12}>
                {`${round(baseArea)}`}
              </Text>
            </FitMafs>
          </div>
          </PhoneMini>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.half"), value: `${round(baseArea * 0.25)}` },
            { label: t("worked.current"), value: `${round(baseArea)}` },
            { label: t("worked.double"), value: `${round(baseArea * 4)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </GapFreeRow>
    </SectionCard>
  );
}
