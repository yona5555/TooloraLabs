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
const X0 = 1;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #7 (trend line + reference point): y = eˣ, with the tangent line at x=1 drawn explicitly — its slope is eˣ itself, the defining property of this calculator's exp key (the function that is its own derivative). */
export default function ExponentialTangentCurve() {
  const t = useTranslations("tools.scientific-calculator.education.functions.exponential");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  const y0 = round3(Math.exp(X0));
  const slope = y0; // d/dx e^x = e^x

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="mafs-canvas w-full shrink-0 overflow-hidden rounded-xl lg:w-[320px]">
          <Mafs viewBox={{ x: [-2, 2.5], y: [-1, 8] }} height={260} pan={false} zoom={false}>
            <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 2 }} />
            <Plot.OfX y={(x) => Math.exp(x)} domain={[-2, 2.2]} color={colors.curve} weight={2.5} />
            <Line.Segment point1={[X0 - 1, y0 - slope]} point2={[X0 + 1, y0 + slope]} color={colors.tangent} weight={2} style="dashed" />
            <Point x={X0} y={y0} color={colors.tangent} svgCircleProps={{ r: 4.5 }} />
          </Mafs>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.x"), value: `${X0}` },
            { label: t("worked.value"), value: `e^${X0} = ${y0}` },
            { label: t("worked.slope"), value: `${slope}`, emphasize: true, note: t("worked.slopeNote") },
          ]}
        />
      </div>
      <p className="mt-3 text-xs opacity-60">{t("hint")}</p>
    </SectionCard>
  );
}
