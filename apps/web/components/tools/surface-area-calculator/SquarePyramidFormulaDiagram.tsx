"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const BASE = 6;
const HEIGHT = 4;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #18 (Formula Diagram): a square pyramid adds one square base to four identical triangular sides — like the cone, the triangles need the slant height, derived from the perpendicular height and half the base via the Pythagorean theorem. */
export default function SquarePyramidFormulaDiagram() {
  const t = useTranslations("tools.surface-area-calculator.education.pyramidFormula");
  const output = tool.execute({ shape: "square-pyramid", baseSide: BASE, height: HEIGHT }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const slant = round2(Math.sqrt((BASE / 2) ** 2 + HEIGHT ** 2));
  const baseArea = BASE * BASE;
  const oneTriangle = round2(0.5 * BASE * slant);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <svg viewBox="0 0 100 100" className="h-24 w-24 text-current">
          <polygon points="20,75 80,75 65,60 35,60" className="fill-blue-600/10 stroke-blue-700 dark:fill-blue-400/10 dark:stroke-blue-300" strokeWidth={1.5} />
          <polygon points="20,75 50,15 65,60" className="fill-blue-600/15 stroke-blue-700 dark:fill-blue-400/15 dark:stroke-blue-300" strokeWidth={2} strokeLinejoin="round" />
          <polygon points="65,60 50,15 80,75" className="fill-blue-600/25 stroke-blue-700 dark:fill-blue-400/25 dark:stroke-blue-300" strokeWidth={2} strokeLinejoin="round" />
        </svg>
        <p className="font-mono text-sm font-bold text-zinc-800 dark:text-zinc-100">{`${BASE}² + 4×(½×${BASE}×${slant}) = ${round2(output.data.surfaceArea)}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.slantFormula"), value: `√(${BASE / 2}² + ${HEIGHT}²) = ${slant}` },
            { label: t("worked.base"), value: `${baseArea}` },
            { label: t("worked.oneTriangle"), value: `${oneTriangle}`, note: t("worked.triangleNote") },
            { label: t("worked.result"), value: `${round2(output.data.surfaceArea)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
