"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const L = 8;
const W = 4;
const H = 3;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #15 (Stacked Segmented Bar): a rectangular prism's total surface area broken into its three real pairs of opposite faces — each pair genuinely different in size unless two dimensions happen to match. */
export default function RectangularPrismFaceBreakdown() {
  const t = useTranslations("tools.surface-area-calculator.education.prismBreakdown");
  const output = tool.execute({ shape: "rectangular-prism", length: L, width: W, height: H }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;

  const pairs = [
    { key: "topBottom", area: 2 * L * W },
    { key: "frontBack", area: 2 * L * H },
    { key: "leftRight", area: 2 * W * H },
  ];
  const total = pairs.reduce((sum, p) => sum + p.area, 0);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { l: L, w: W, h: H })}</p>
      <div dir="ltr" className="mt-4 flex h-10 w-full overflow-hidden rounded-lg">
        {pairs.map((p, i) => (
          <div
            key={p.key}
            className={`flex items-center justify-center text-xs font-bold text-white ${["bg-blue-600", "bg-emerald-600", "bg-amber-600"][i]}`}
            style={{ width: `${(p.area / total) * 100}%` }}
          >
            {round2(p.area)}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            ...pairs.map((p) => ({ label: t(`worked.${p.key}`), value: `${round2(p.area)}` })),
            { label: t("worked.total"), value: `${round2(output.data.surfaceArea)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
