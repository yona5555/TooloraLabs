"use client";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { Mafs, Coordinates, Plot, Point, Text } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { ScientificCalculator } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificAngle } from "./ScientificAngleContext";
import GapFreeRow from "@/components/tool-ui/GapFreeRow";

const tool = new ScientificCalculator();
const LIGHT = { rose: "#e11d48", emerald: "#059669" };
const DARK = { rose: "#fb7185", emerald: "#34d399" };

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #7 (Trend Line with Highlighted Reference Point): the real sine and cosine curves over a full turn, with a live marker riding along both at the hero's own current angle. */
export default function TrigWaveCurve() {
  const t = useTranslations("tools.scientific-calculator.education.trigWave");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useScientificAngle();

  const sinOut = tool.execute({ operation: "sin", a: dims.angleDeg, angleMode: "deg" }, { locale: "en-US" });
  const cosOut = tool.execute({ operation: "cos", a: dims.angleDeg, angleMode: "deg" }, { locale: "en-US" });
  if (!sinOut.success || !cosOut.success) return null;
  const sin = round3(sinOut.data.result);
  const cos = round3(cosOut.data.result);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <GapFreeRow className="mt-4">
        <div dir="ltr" className="mafs-canvas w-full overflow-hidden rounded-xl lg:flex-1">
          <PhoneMini slot={1} title={t("title")}>
            <Mafs viewBox={{ x: [0, 360], y: [-1.3, 1.3] }} height={200} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 90 }} yAxis={{ lines: 0.5, labels: (v) => (Math.abs(v) <= 1 ? `${v}` : "") }} />
              <Plot.OfX y={(x) => Math.sin((x * Math.PI) / 180)} color={colors.rose} />
              <Plot.OfX y={(x) => Math.cos((x * Math.PI) / 180)} color={colors.emerald} />
              <Point x={dims.angleDeg} y={sin} color={colors.rose} />
              <Point x={dims.angleDeg} y={cos} color={colors.emerald} />
              <Text x={45} y={1.15} size={12} color={colors.rose}>
                sin(x)
              </Text>
              <Text x={45} y={-1.15} size={12} color={colors.emerald}>
                cos(x)
              </Text>
            </Mafs>
          </PhoneMini>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.angle"), value: `${round3(dims.angleDeg)}°` },
            { label: "sin", value: `${sin}`, emphasize: true },
            { label: "cos", value: `${cos}`, emphasize: true },
          ]}
        />
      </GapFreeRow>
    </SectionCard>
  );
}
