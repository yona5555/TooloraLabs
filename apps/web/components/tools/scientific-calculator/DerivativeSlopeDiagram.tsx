"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Line, Point } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { ScientificCalculator } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificAngle } from "./ScientificAngleContext";

const tool = new ScientificCalculator();
const LIGHT = { rose: "#e11d48", blue: "#2563eb" };
const DARK = { rose: "#fb7185", blue: "#60a5fa" };

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #7 (Trend Line with Highlighted Reference Point): the real numerical derivative of sin(x) — computed by the calculator's own central-difference engine, not a hardcoded cos(x) — drawn as the live tangent line at the hero's current angle. */
export default function DerivativeSlopeDiagram() {
  const t = useTranslations("tools.scientific-calculator.education.derivativeSlope");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useScientificAngle();

  const sinOut = tool.execute({ operation: "sin", a: dims.angleDeg, angleMode: "deg" }, { locale: "en-US" });
  const slopeOut = tool.execute({ operation: "numDerivativeSin", a: dims.angleDeg, angleMode: "deg" }, { locale: "en-US" });
  if (!sinOut.success || !slopeOut.success) return null;
  const y0 = sinOut.data.result;
  const slope = slopeOut.data.result;

  const tangent = (x: number) => y0 + slope * ((x - dims.angleDeg) * Math.PI) / 180;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mafs-canvas mt-4 w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [0, 360], y: [-1.3, 1.3] }} height={200} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 90 }} yAxis={{ lines: 0.5, labels: (v) => (Math.abs(v) <= 1 ? `${v}` : "") }} />
          <Plot.OfX y={(x) => Math.sin((x * Math.PI) / 180)} color={colors.rose} />
          <Line.Segment point1={[dims.angleDeg - 45, tangent(dims.angleDeg - 45)]} point2={[dims.angleDeg + 45, tangent(dims.angleDeg + 45)]} color={colors.blue} weight={2.5} />
          <Point x={dims.angleDeg} y={y0} color={colors.blue} />
        </Mafs>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.angle"), value: `${round3(dims.angleDeg)}°` },
            { label: t("worked.sinValue"), value: `${round3(y0)}` },
            { label: t("worked.slope"), value: `${round3(slope)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
