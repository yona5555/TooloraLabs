"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const SIDE = 3;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #7-style annotated comparison: doubling a cube's side doesn't double its surface area — every formula on this page scales with dimensions squared, so doubling one length always quadruples the corresponding area. */
export default function DoublingDimensionsEffect() {
  const t = useTranslations("tools.surface-area-calculator.education.doublingEffect");
  const original = tool.execute({ shape: "cube", side: SIDE }, { locale: "en-US" });
  const doubled = tool.execute({ shape: "cube", side: SIDE * 2 }, { locale: "en-US" });
  if (!original.success || original.data.error || !doubled.success || doubled.data.error) return null;

  const ratio = round2(doubled.data.surfaceArea / original.data.surfaceArea);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`s = ${SIDE}`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{`A = ${round2(original.data.surfaceArea)}`}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{`s = ${SIDE * 2}`}</p>
          <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">{`A = ${round2(doubled.data.surfaceArea)}`}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.ratio"), value: `${ratio}×`, emphasize: true, note: t("worked.note") }]} />
      </div>
    </SectionCard>
  );
}
