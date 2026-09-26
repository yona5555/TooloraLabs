import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import TipWorkedExampleNote from "./TipWorkedExampleNote";

/** Documented full-service-dining tipping convention by service tier, applied to the same $85 bill — shown as a colored quality scale (poor→excellent) rather than a bar list, matching what this diagram is actually about. */
const BILL = 85;
const TIERS = [
  { key: "poor", percent: 10, colorClass: "fill-red-500 dark:fill-red-400" },
  { key: "average", percent: 15, colorClass: "fill-amber-500 dark:fill-amber-400" },
  { key: "good", percent: 18, colorClass: "fill-lime-500 dark:fill-lime-400" },
  { key: "excellent", percent: 25, colorClass: "fill-emerald-500 dark:fill-emerald-400" },
];

const WIDTH = 340;
const SEGMENT_HEIGHT = 34;
const SEGMENT_GAP = 4;

export default async function TipServiceQualityScaleChart() {
  const t = await getTranslations("tools.tip-calculator.serviceQualityScaleChart");
  const tTiers = await getTranslations("tools.tip-calculator.serviceQualityScaleChart.tiers");
  const tRoot = await getTranslations("tools.tip-calculator");

  const maxPercent = Math.max(...TIERS.map((tier) => tier.percent));
  const height = TIERS.length * (SEGMENT_HEIGHT + SEGMENT_GAP) - SEGMENT_GAP;
  const rows = TIERS.map((tier) => ({ label: `${tTiers(tier.key)} (${tier.percent}%)`, value: `$${(BILL * (tier.percent / 100)).toFixed(2)}` }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { bill: BILL.toFixed(2) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1 overflow-x-auto" dir="ltr">
          <svg width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={t("title")} className="block min-w-[300px] text-current">
            {TIERS.map((tier, i) => {
              const tip = BILL * (tier.percent / 100);
              const y = i * (SEGMENT_HEIGHT + SEGMENT_GAP);
              const barWidth = 90 + (tier.percent / maxPercent) * (WIDTH - 90 - 90);
              return (
                <g key={tier.key}>
                  <rect x={0} y={y} width={barWidth} height={SEGMENT_HEIGHT} rx={6} className={tier.colorClass} opacity={0.85} />
                  <text x={10} y={y + SEGMENT_HEIGHT / 2 + 4} fontSize={12} fontWeight={700} fill="white">
                    {tTiers(tier.key)} ({tier.percent}%)
                  </text>
                  <text x={WIDTH} y={y + SEGMENT_HEIGHT / 2 + 4} textAnchor="end" fontSize={12} fontWeight={700} fill="currentColor">
                    ${tip.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <TipWorkedExampleNote title={tRoot("workedExampleTitle")} rows={rows} />
      </div>
    </SectionCard>
  );
}
