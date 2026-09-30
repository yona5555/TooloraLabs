"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const SIDE = 4;

const STATIONS = ["flat", "fold1", "fold2", "fold3", "closed"] as const;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #9 (Timeline with Stations): the same six real squares, tracked through the physical stations of folding a flat net into a closed cube — the total surface area never changes, only its shape does. */
export default function CubeNetFoldingSteps() {
  const t = useTranslations("tools.surface-area-calculator.education.netFolding");
  const output = tool.execute({ shape: "cube", side: SIDE }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const total = round2(output.data.surfaceArea);
  const faceArea = round2(SIDE * SIDE);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5 flex items-start justify-between gap-1">
        {STATIONS.map((key, i) => (
          <div key={key} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center">
              {key === "flat" && (
                <div className="grid grid-cols-4 grid-rows-2 gap-px">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className={`h-3 w-3 rounded-sm bg-blue-500/70 ${idx === 5 ? "col-start-4 row-start-2" : ""}`} style={{ gridColumn: idx < 4 ? idx + 1 : idx === 4 ? 1 : undefined, gridRow: idx < 4 ? 1 : 2 }} />
                  ))}
                </div>
              )}
              {key !== "flat" && key !== "closed" && (
                <div className="relative h-10 w-10" style={{ perspective: "200px" }}>
                  <div className="absolute inset-0 rounded-sm border-2 border-blue-500 bg-blue-500/20" style={{ transform: `rotateY(${i * 25}deg)` }} />
                </div>
              )}
              {key === "closed" && (
                <div className="relative h-10 w-10 rounded-sm border-2 border-emerald-500 bg-emerald-500/25" />
              )}
            </div>
            <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{t(`stations.${key}`)}</p>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.perFace"), value: `${faceArea}` },
            { label: t("worked.faceCount"), value: "6" },
            { label: t("worked.total"), value: `${total}`, emphasize: true, note: t("worked.invariantNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
