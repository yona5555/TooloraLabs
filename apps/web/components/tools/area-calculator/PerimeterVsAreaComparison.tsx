"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const RECT_A = { width: 8, height: 2 };
const RECT_B = { width: 5, height: 5 };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #16 (Side-by-Side Comparison Cards): two rectangles with the exact same perimeter (20) but genuinely different areas — the same amount of fencing can enclose very different amounts of land depending on the shape. */
export default function PerimeterVsAreaComparison() {
  const t = useTranslations("tools.area-calculator.education.perimeterVsArea");
  const a = tool.execute({ shape: "rectangle", width: RECT_A.width, height: RECT_A.height }, { locale: "en-US" });
  const b = tool.execute({ shape: "rectangle", width: RECT_B.width, height: RECT_B.height }, { locale: "en-US" });
  if (!a.success || a.data.error || !b.success || b.data.error) return null;

  const perimeterA = 2 * (RECT_A.width + RECT_A.height);
  const perimeterB = 2 * (RECT_B.width + RECT_B.height);

  const cards = [
    { key: "a", dims: RECT_A, area: a.data.area, perimeter: perimeterA },
    { key: "b", dims: RECT_B, area: b.data.area, perimeter: perimeterB },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.key} className="rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-700">
            <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{`${c.dims.width} × ${c.dims.height}`}</p>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("perimeterLabel")}</span>
              <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-200">{round2(c.perimeter)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("areaLabel")}</span>
              <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{round2(c.area)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("note")}</p>
    </SectionCard>
  );
}
