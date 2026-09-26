import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import DiscountWorkedExampleNote from "./DiscountWorkedExampleNote";

// Illustrative, not data-driven: 100 -> 70 (30% off) -> 63 (further 10% off).
const WIDTH = 320;
const BAR_HEIGHT = 26;
const ROW_GAP = 20;
const HEIGHT = BAR_HEIGHT * 3 + ROW_GAP * 2 + 4;
const ROWS = [
  { width: WIDTH, fraction: 1 },
  { width: WIDTH * 0.7, fraction: 0.7 },
  { width: WIDTH * 0.63, fraction: 0.63 },
];

export default async function DiscountStackDiagram() {
  const t = await getTranslations("tools.discount-calculator.education.intro.diagram");
  const tRoot = await getTranslations("tools.discount-calculator");

  const labels = [t("startLabel"), t("afterFirstLabel"), t("afterSecondLabel")];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1 overflow-x-auto" dir="ltr">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
            {ROWS.map((row, i) => {
              const y = i * (BAR_HEIGHT + ROW_GAP);
              return (
                <g key={i}>
                  <rect x={0} y={y} width={WIDTH} height={BAR_HEIGHT} rx={4} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.3} />
                  <rect x={0} y={y} width={row.width} height={BAR_HEIGHT} rx={4} fill="currentColor" opacity={0.15 + i * 0.25} />
                  <text x={8} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} fill="currentColor">
                    {labels[i]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <DiscountWorkedExampleNote
          title={tRoot("workedExampleTitle")}
          rows={[
            { label: t("step1"), value: labels[0] },
            { label: t("step2"), value: labels[1] },
            { label: t("step3"), value: labels[2], emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
