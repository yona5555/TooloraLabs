import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { LoanAmortizationYear } from "@tooloralabs/tools";

type LoanPayoffChartProps = {
  amortizationSchedule: LoanAmortizationYear[];
  loanAmount: number;
  totalInterest: number;
  digitStyle: DigitStyle;
};

const CHART_HEIGHT = 200;
const BAR_WIDTH = 10;
const BAR_GAP = 6;
const STEP = BAR_WIDTH + BAR_GAP;

export default function LoanPayoffChart({ amortizationSchedule, loanAmount, totalInterest, digitStyle }: LoanPayoffChartProps) {
  const t = useTranslations("tools.loan-calculator");

  if (amortizationSchedule.length === 0) return null;

  const maxYearPayment = Math.max(...amortizationSchedule.map((row) => row.principalPaid + row.interestPaid), 1);
  const initialBalance = loanAmount || 1;
  const width = amortizationSchedule.length * STEP;

  function balanceY(balance: number): number {
    return CHART_HEIGHT - (Math.min(Math.max(balance, 0), initialBalance) / initialBalance) * CHART_HEIGHT;
  }

  const balancePoints = [
    `${-BAR_GAP / 2},${balanceY(initialBalance)}`,
    ...amortizationSchedule.map((row, i) => `${i * STEP + BAR_WIDTH / 2},${balanceY(row.endingBalance)}`),
  ].join(" ");

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <SectionCard title={t("payoffChart.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("payoffChart.intro")}</p>

      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg
          viewBox={`-8 -8 ${width + 16} ${CHART_HEIGHT + 16}`}
          role="img"
          aria-label={t("payoffChart.title")}
          className="h-56"
          style={{ minWidth: Math.max(width, 320) }}
        >
          {amortizationSchedule.map((row, i) => {
            const total = row.principalPaid + row.interestPaid;
            const barHeight = (total / maxYearPayment) * CHART_HEIGHT;
            const interestHeight = (row.interestPaid / maxYearPayment) * CHART_HEIGHT;
            const principalHeight = barHeight - interestHeight;
            const x = i * STEP;
            return (
              <g key={row.year}>
                <rect
                  x={x}
                  y={CHART_HEIGHT - barHeight}
                  width={BAR_WIDTH}
                  height={principalHeight}
                  className="fill-blue-600 dark:fill-blue-400"
                />
                <rect
                  x={x}
                  y={CHART_HEIGHT - barHeight + principalHeight}
                  width={BAR_WIDTH}
                  height={interestHeight}
                  className="fill-amber-400 dark:fill-amber-500"
                />
              </g>
            );
          })}

          <polyline points={balancePoints} fill="none" strokeWidth={2} className="stroke-zinc-900 dark:stroke-zinc-100" />
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {t("payoffChart.principalLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" />
          {t("payoffChart.interestLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
          {t("payoffChart.balanceLabel")}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <span className="text-zinc-600 dark:text-zinc-300">
          {t("payoffChart.totalPrincipalLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {currency(loanAmount)}
          </strong>
        </span>
        <span className="text-zinc-600 dark:text-zinc-300">
          {t("payoffChart.totalInterestLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {currency(totalInterest)}
          </strong>
        </span>
      </div>
    </SectionCard>
  );
}
