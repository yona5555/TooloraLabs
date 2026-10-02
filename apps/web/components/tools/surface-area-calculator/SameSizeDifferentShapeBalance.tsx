"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, characteristicLength, computeSurfaceAreaFor, round } from "./surfaceAreaEducationMath";

/** Type #14 (Balance Indicator): the live solid's own real surface area against a cube built from its own characteristic length — a genuine head-to-head of "same size, different shape". */
export default function SameSizeDifferentShapeBalance() {
  const t = useTranslations("tools.surface-area-calculator.education.sameSizeBalance");
  const tShape = useTranslations("tools.surface-area-calculator.form");
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const liveTotal = computeSurfaceAreaFor(n);
  const length = characteristicLength(n);
  const cubeArea = 6 * length * length;
  const total = liveTotal + cubeArea || 1;
  const livePct = (liveTotal / total) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { length: round(length), shape: tShape(`shape.${dims.shape}`) })}</p>
      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300" style={{ width: `${livePct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-sm font-semibold">
            <span className="text-blue-700 dark:text-blue-400">{`${tShape(`shape.${dims.shape}`)}: ${round(liveTotal)}`}</span>
            <span className="text-zinc-500 dark:text-zinc-400">{`${tShape("shape.cube")} (${round(length)}): ${round(cubeArea)}`}</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.difference"), value: `${round(Math.abs(liveTotal - cubeArea))}` },
            { label: t("worked.winner"), value: liveTotal >= cubeArea ? tShape(`shape.${dims.shape}`) : tShape("shape.cube"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
