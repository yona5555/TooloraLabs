"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Point, Line } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { ScientificCalculator } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificAngle } from "./ScientificAngleContext";

const tool = new ScientificCalculator();
const LIGHT = { amber: "#d97706", zinc: "#a1a1aa" };
const DARK = { amber: "#fbbf24", zinc: "#71717a" };

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #7 (Trend Line with Highlighted Reference Point): the real tangent curve, whose own two vertical asymptotes near 90° and 270° are exactly where the calculator's tan() operation itself returns an out-of-range error. */
export default function ExponentialTangentCurve() {
  const t = useTranslations("tools.scientific-calculator.education.tangentCurve");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useScientificAngle();

  const tanOut = tool.execute({ operation: "tan", a: dims.angleDeg, angleMode: "deg" }, { locale: "en-US" });
  const isDefined = tanOut.success;
  const tanValue = isDefined ? round3(tanOut.data.result) : null;
  const clampedTan = isDefined ? Math.max(-8, Math.min(8, tanOut.data.result)) : 0;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mafs-canvas mt-4 w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [0, 360], y: [-8, 8] }} height={200} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 90 }} yAxis={{ lines: 2 }} />
          <Line.Segment point1={[90, -8]} point2={[90, 8]} color={colors.zinc} weight={1} style="dashed" opacity={0.5} />
          <Line.Segment point1={[270, -8]} point2={[270, 8]} color={colors.zinc} weight={1} style="dashed" opacity={0.5} />
          <Plot.OfX y={(x) => Math.max(-8, Math.min(8, Math.tan((x * Math.PI) / 180)))} domain={[0, 89]} color={colors.amber} />
          <Plot.OfX y={(x) => Math.max(-8, Math.min(8, Math.tan((x * Math.PI) / 180)))} domain={[91, 269]} color={colors.amber} />
          <Plot.OfX y={(x) => Math.max(-8, Math.min(8, Math.tan((x * Math.PI) / 180)))} domain={[271, 360]} color={colors.amber} />
          {isDefined && <Point x={dims.angleDeg} y={clampedTan} color={colors.amber} />}
        </Mafs>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.angle"), value: `${round3(dims.angleDeg)}°` },
            { label: "tan", value: isDefined ? `${tanValue}` : t("worked.undefined"), emphasize: true, note: isDefined ? undefined : t("worked.asymptoteNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
