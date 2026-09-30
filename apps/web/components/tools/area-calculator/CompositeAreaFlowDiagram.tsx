"use client";
import { Plus, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const RECT = { width: 8, height: 5 };
const TRIANGLE = { base: 8, height: 3 };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #2 (Flow Arrow with Embedded Numbers): a real composite shape — a rectangular wall with a triangular roof gable — split into the two basic shapes this tool already solves, then added together, the actual technique behind any irregular real-world floor plan. */
export default function CompositeAreaFlowDiagram() {
  const t = useTranslations("tools.area-calculator.education.compositeArea");
  const rect = tool.execute({ shape: "rectangle", width: RECT.width, height: RECT.height }, { locale: "en-US" });
  const triangle = tool.execute({ shape: "triangle", base: TRIANGLE.base, height: TRIANGLE.height }, { locale: "en-US" });
  if (!rect.success || rect.data.error || !triangle.success || triangle.data.error) return null;

  const total = round2(rect.data.area + triangle.data.area);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xs text-zinc-400">{t("wallLabel")}</p>
          <p className="font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{round2(rect.data.area)}</p>
        </div>
        <Plus className="shrink-0 text-blue-500" size={18} />
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xs text-zinc-400">{t("gableLabel")}</p>
          <p className="font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{round2(triangle.data.area)}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("totalLabel")}</p>
          <p className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-300">{total}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.rectangle"), value: `${RECT.width} × ${RECT.height} = ${round2(rect.data.area)}` },
            { label: t("worked.triangle"), value: `½ × ${TRIANGLE.base} × ${TRIANGLE.height} = ${round2(triangle.data.area)}` },
            { label: t("worked.total"), value: `${total}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
