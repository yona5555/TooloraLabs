"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Line, Point } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const LIGHT = { curve: "#2563eb", tangent: "#dc2626" };
const DARK = { curve: "#60a5fa", tangent: "#f87171" };
const X0 = Math.PI / 3;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #18 (Formula Diagram): the calculator's numeric-derivative key applied to sin(x) at x = π/3 (radians) — the tangent line's slope is exactly cos(x0), read straight off the same curve the value came from. */
export default function DerivativeSlopeDiagram() {
  const t = useTranslations("tools.scientific-calculator.education.functions.derivative");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  const y0 = round3(Math.sin(X0));
  const slope = round3(Math.cos(X0));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="mafs-canvas w-full shrink-0 overflow-hidden rounded-xl lg:w-[320px]">
          <Mafs viewBox={{ x: [-0.5, 4], y: [-1.3, 1.3] }} height={230} pan={false} zoom={false}>
            <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 0.5 }} />
            <Plot.OfX y={(x) => Math.sin(x)} domain={[-0.5, 4]} color={colors.curve} weight={2.5} />
            <Line.Segment point1={[X0 - 0.7, y0 - slope * 0.7]} point2={[X0 + 0.7, y0 + slope * 0.7]} color={colors.tangent} weight={2} style="dashed" />
            <Point x={X0} y={y0} color={colors.tangent} svgCircleProps={{ r: 4.5 }} />
          </Mafs>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.x"), value: "π/3 ≈ 1.047" },
            { label: t("worked.value"), value: `sin(π/3) = ${y0}` },
            { label: t("worked.slope"), value: `cos(π/3) = ${slope}`, emphasize: true, note: t("worked.slopeNote") },
          ]}
        />
      </div>
      <p className="mt-3 text-xs opacity-60">{t("hint")}</p>
    </SectionCard>
  );
}
