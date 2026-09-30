"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const CUBE_SIDE = 4;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #14 (Balance Indicator): a cube and a sphere holding the exact same real volume — the sphere always needs less surface area to enclose it, the 3D analog of a circle beating a square at equal perimeter, and the real reason bubbles and planets are spherical. */
export default function SphereVsCubeEfficiency() {
  const t = useTranslations("tools.surface-area-calculator.education.sphereVsCube");
  const volume = CUBE_SIDE ** 3;
  const radius = Math.cbrt((3 * volume) / (4 * Math.PI));

  const cube = tool.execute({ shape: "cube", side: CUBE_SIDE }, { locale: "en-US" });
  const sphere = tool.execute({ shape: "sphere", radius }, { locale: "en-US" });
  if (!cube.success || cube.data.error || !sphere.success || sphere.data.error) return null;

  const cubePct = 50;
  const spherePct = round2((sphere.data.surfaceArea / cube.data.surfaceArea) * 50);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { volume })}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 dark:border-zinc-900" style={{ left: `${cubePct}%` }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-600 dark:border-zinc-900" style={{ left: `${spherePct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-sm font-semibold">
          <span className="text-emerald-700 dark:text-emerald-400">{`${t("sphereLabel")}: ${round2(sphere.data.surfaceArea)}`}</span>
          <span className="text-blue-700 dark:text-blue-400">{`${t("cubeLabel")}: ${round2(cube.data.surfaceArea)}`}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.radius"), value: `${round2(radius)}` },
            { label: t("worked.sphereArea"), value: `${round2(sphere.data.surfaceArea)}`, emphasize: true },
            { label: t("worked.cubeArea"), value: `${round2(cube.data.surfaceArea)}`, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
