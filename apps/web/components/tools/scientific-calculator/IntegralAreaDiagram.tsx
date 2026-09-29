"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Polygon } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const LIGHT = { curve: "#2563eb" };
const DARK = { curve: "#60a5fa" };
const UPPER = 3;
const SAMPLES = 24;

/** Type #15 (Stacked Segmented Bar, adapted to a filled area): the region under y = x^2 from 0 to 3, shaded to show what the calculator's numeric-integral key is actually accumulating — the exact value (9) matches the closed-form x^3/3. */
export default function IntegralAreaDiagram() {
  const t = useTranslations("tools.scientific-calculator.education.functions.integral");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  const area = (UPPER ** 3) / 3;
  const points: [number, number][] = [[0, 0]];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = (i / SAMPLES) * UPPER;
    points.push([x, x * x]);
  }
  points.push([UPPER, 0]);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="mafs-canvas w-full shrink-0 overflow-hidden rounded-xl lg:w-[320px]">
          <Mafs viewBox={{ x: [-0.5, 4], y: [-1, 10] }} height={230} pan={false} zoom={false}>
            <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 2 }} />
            <Polygon points={points} color={colors.curve} fillOpacity={0.18} strokeOpacity={0} />
            <Plot.OfX y={(x) => x * x} domain={[-0.5, 3.3]} color={colors.curve} weight={2.5} />
          </Mafs>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.function"), value: "y = x²" },
            { label: t("worked.bounds"), value: `0 → ${UPPER}` },
            { label: t("worked.area"), value: `${UPPER}³ / 3 = ${area}`, emphasize: true, note: t("worked.areaNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
