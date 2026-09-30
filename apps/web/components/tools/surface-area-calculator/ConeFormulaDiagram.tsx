"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const RADIUS = 3;
const HEIGHT = 4;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #18 (Formula Diagram): a cone's surface adds a circular base to a curved lateral surface, but the lateral formula needs the SLANT height, not the perpendicular height this tool actually asks for — derived here via the Pythagorean theorem, exactly as the engine does internally. */
export default function ConeFormulaDiagram() {
  const t = useTranslations("tools.surface-area-calculator.education.coneFormula");
  const output = tool.execute({ shape: "cone", radius: RADIUS, height: HEIGHT }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const slant = round2(Math.sqrt(RADIUS * RADIUS + HEIGHT * HEIGHT));
  const base = round2(Math.PI * RADIUS * RADIUS);
  const lateral = round2(Math.PI * RADIUS * slant);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <svg viewBox="0 0 100 100" className="h-24 w-24 text-current">
          <ellipse cx={50} cy={80} rx={30} ry={9} className="fill-blue-600/15 stroke-blue-700 dark:fill-blue-400/15 dark:stroke-blue-300" strokeWidth={2} />
          <path d="M 20 80 L 50 15 L 80 80" className="fill-blue-600/10 stroke-blue-700 dark:fill-blue-400/10 dark:stroke-blue-300" strokeWidth={2} strokeLinejoin="round" />
          <line x1={50} y1={80} x2={50} y2={15} strokeDasharray="2 2" className="stroke-current opacity-50" strokeWidth={1} />
        </svg>
        <p className="font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{`π${RADIUS}² + π${RADIUS}(${slant}) = ${round2(output.data.surfaceArea)}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.slantFormula"), value: `√(${RADIUS}² + ${HEIGHT}²) = ${slant}` },
            { label: t("worked.base"), value: `${base}` },
            { label: t("worked.lateral"), value: `${lateral}` },
            { label: t("worked.result"), value: `${round2(output.data.surfaceArea)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
