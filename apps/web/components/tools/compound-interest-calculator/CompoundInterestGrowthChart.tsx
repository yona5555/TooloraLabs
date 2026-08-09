import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { YearlyGrowthPoint } from "@tooloralabs/tools";

type CompoundInterestGrowthChartProps = {
  yearlySchedule: YearlyGrowthPoint[];
  principal: number;
  totalContributions: number;
  totalInterest: number;
  digitStyle: DigitStyle;
};

const CHART_HEIGHT = 200;
const BAR_WIDTH = 10;
const BAR_GAP = 6;
const STEP = BAR_WIDTH + BAR_GAP;

export default function CompoundInterestGrowthChart({
  yearlySchedule,
  principal,
  totalContributions,
  totalInterest,
  digitStyle,
}: CompoundInterestGrowthChartProps) {
  const t = useTranslations("tools.compound-interest-calculator");

  if (yearlySchedule.length === 0) return null;

  const maxBalance = Math.max(...yearlySchedule.map((row) => row.balance), 1);
  const width = yearlySchedule.length * STEP;

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <SectionCard title={t("growthChart.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("growthChart.intro")}</p>

      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg
          viewBox={`-8 -8 ${width + 16} ${CHART_HEIGHT + 16}`}
          role="img"
          aria-label={t("growthChart.title")}
          className="h-56"
          style={{ minWidth: Math.max(width, 320) }}
        >
          {yearlySchedule.map((row, i) => {
            const contributed = principal + row.contributions;
            const barHeight = (row.balance / maxBalance) * CHART_HEIGHT;
            const contributedHeight = (contributed / maxBalance) * CHART_HEIGHT;
            const interestHeight = barHeight - contributedHeight;
            const x = i * STEP;
            return (
              <g key={row.year}>
                <rect
                  x={x}
                  y={CHART_HEIGHT - contributedHeight}
                  width={BAR_WIDTH}
                  height={contributedHeight}
                  className="fill-blue-600 dark:fill-blue-400"
                />
                <rect
                  x={x}
                  y={CHART_HEIGHT - barHeight}
                  width={BAR_WIDTH}
                  height={interestHeight}
                  className="fill-amber-400 dark:fill-amber-500"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {t("growthChart.contributedLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" />
          {t("growthChart.interestLabel")}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <span className="text-zinc-600 dark:text-zinc-300">
          {t("growthChart.totalContributedLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {currency(principal + totalContributions)}
          </strong>
        </span>
        <span className="text-zinc-600 dark:text-zinc-300">
          {t("growthChart.totalInterestLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {currency(totalInterest)}
          </strong>
        </span>
      </div>
    </SectionCard>
  );
}
