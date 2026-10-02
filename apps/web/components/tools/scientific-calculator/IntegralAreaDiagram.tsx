"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Polygon } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificAngle } from "./ScientificAngleContext";

type Vector2 = [number, number];
const LIGHT = { rose: "#e11d48" };
const DARK = { rose: "#fb7185" };
const SAMPLES = 60;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #7-style shaded-area diagram: the real area under sin(x) from 0 to the hero's current angle — the closed form 1 − cos(θ), verified here by sampling the same curve the calculator itself evaluates. */
export default function IntegralAreaDiagram() {
  const t = useTranslations("tools.scientific-calculator.education.integralArea");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useScientificAngle();

  const angleRad = (dims.angleDeg * Math.PI) / 180;
  const area = round3(1 - Math.cos(angleRad));

  const points: Vector2[] = [[0, 0]];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = (dims.angleDeg * i) / SAMPLES;
    points.push([x, Math.sin((x * Math.PI) / 180)]);
  }
  points.push([dims.angleDeg, 0]);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="mafs-canvas w-full overflow-hidden rounded-xl lg:flex-1">
          <Mafs viewBox={{ x: [0, 360], y: [-0.2, 1.3] }} height={200} pan={false} zoom={false} preserveAspectRatio={false}>
            <Coordinates.Cartesian xAxis={{ lines: 90 }} yAxis={{ lines: 0.5, labels: (v) => (Math.abs(v) <= 1 ? `${v}` : "") }} />
            <Plot.OfX y={(x) => Math.sin((x * Math.PI) / 180)} color={colors.rose} />
            {dims.angleDeg > 0.5 && <Polygon points={points} color={colors.rose} fillOpacity={0.25} strokeOpacity={0} />}
          </Mafs>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: "∫₀^θ sin(x) dx = 1 − cos(θ)" },
            { label: t("worked.angle"), value: `${round3(dims.angleDeg)}°` },
            { label: t("worked.area"), value: `${area}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
