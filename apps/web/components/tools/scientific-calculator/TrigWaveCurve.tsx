"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Point, Text } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const LIGHT = { sin: "#dc2626", cos: "#16a34a", faint: "#a1a1aa" };
const DARK = { sin: "#f87171", cos: "#4ade80", faint: "#71717a" };
const REFERENCE_DEG = 150;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Type #7 (trend line + reference point): the actual sin/cos WAVE — the same two functions the unit circle above defines geometrically, now plotted as a continuous curve over a full range, the way a graphing view of those two keys would look. */
export default function TrigWaveCurve() {
  const t = useTranslations("tools.scientific-calculator.education.functions.trigWave");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const sinRef = round2(Math.sin(toRad(REFERENCE_DEG)));
  const cosRef = round2(Math.cos(toRad(REFERENCE_DEG)));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="mafs-canvas w-full shrink-0 overflow-hidden rounded-xl lg:w-[340px]">
          <Mafs viewBox={{ x: [-370, 370], y: [-1.3, 1.3] }} height={230} pan={false} zoom={false} preserveAspectRatio={false}>
            <Coordinates.Cartesian xAxis={{ lines: 90 }} yAxis={{ lines: 0.5 }} />
            <Plot.OfX y={(deg) => Math.sin(toRad(deg))} domain={[-360, 360]} color={colors.sin} weight={2.5} />
            <Plot.OfX y={(deg) => Math.cos(toRad(deg))} domain={[-360, 360]} color={colors.cos} weight={2.5} />
            <Point x={REFERENCE_DEG} y={sinRef} color={colors.sin} svgCircleProps={{ r: 4.5 }} />
            <Point x={REFERENCE_DEG} y={cosRef} color={colors.cos} svgCircleProps={{ r: 4.5 }} />
            <Text x={REFERENCE_DEG} y={1.15} size={11} color={colors.faint}>
              {`${REFERENCE_DEG}°`}
            </Text>
          </Mafs>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.angle"), value: `${REFERENCE_DEG}°` },
            { label: t("worked.sin"), value: `${sinRef}` },
            { label: t("worked.cos"), value: `${cosRef}` },
            { label: t("worked.period"), value: "360°", emphasize: true, note: t("worked.periodNote") },
          ]}
        />
      </div>
      <p className="mt-3 text-xs opacity-60">{t("hint")}</p>
    </SectionCard>
  );
}
