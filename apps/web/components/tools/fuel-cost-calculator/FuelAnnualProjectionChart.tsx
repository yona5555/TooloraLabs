"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertAmount } from "@/lib/currency";
import AutoFitText from "@/components/tool-ui/AutoFitText";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";
import SectionCard from "@/components/tool-ui/SectionCard";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import { ltrIsolate } from "@/lib/bidi";

/** Cumulative cost at 3/6/9/12 months for a fixed monthly distance — same cost formula, projected over time as a running total. */
const MONTHLY_DISTANCE = 1000;
const EFFICIENCY = 25;
const PRICE = 3.5;
const MONTHLY_COST = (MONTHLY_DISTANCE / EFFICIENCY) * PRICE;
const MONTH_MARKS = [3, 6, 9, 12];

const STEP_W = 78;
const STEP_GAP = 6;
const PAD_TOP = 34;
const MAX_STEP_H = 96;
const BASELINE_Y = PAD_TOP + MAX_STEP_H;
const WIDTH = MONTH_MARKS.length * STEP_W + (MONTH_MARKS.length - 1) * STEP_GAP + 40;
const HEIGHT = BASELINE_Y + 30;
const VALUE_STEPS = ["text-xs"];

/**
 * §31 Type #13 (Stepped Diagram): a genuine cumulative accumulation over 4
 * real time checkpoints — each step literally is the running total so far,
 * so an ascending staircase (each step taller than the last) matches the
 * data itself, not just a stylistic choice. Replaces a continuous line +
 * dots, which read this as a smooth trend rather than the 4 discrete
 * checkpoints it actually is.
 */
export default function FuelAnnualProjectionChart() {
  const t = useTranslations("tools.fuel-cost-calculator.annualProjectionChart");
  const tf = useTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const td = useTranslations("tools.fuel-cost-calculator.diagram");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";
  const money = (usd: number, maximumFractionDigits = 0) =>
    formatLocalizedNumber(convertAmount(usd, "USD", currency), digitStyle, { style: "currency", currency, maximumFractionDigits });

  const points = MONTH_MARKS.map((months) => {
    const cost = MONTHLY_COST * months;
    return { x: months, label: t("months", { count: months }), value: cost, formatted: money(cost) };
  });

  const finalPoint = points[points.length - 1]; // 12 months — the chart's own last plotted value
  const firstPoint = points[0]; // 3 months — the chart's own first plotted value, for the total-cost comparison
  const maxValue = finalPoint.value;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t("caption", { distance: MONTHLY_DISTANCE.toLocaleString("en-US"), efficiency: EFFICIENCY, price: money(PRICE, 2) })}
      </p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="mx-auto block min-w-[300px] text-current">
            <line x1={10} y1={BASELINE_Y} x2={WIDTH - 10} y2={BASELINE_Y} className="stroke-current opacity-20" strokeWidth={1} />
            {points.map((p, i) => {
              const stepH = Math.max((p.value / maxValue) * MAX_STEP_H, 10);
              const x = 20 + i * (STEP_W + STEP_GAP);
              const y = BASELINE_Y - stepH;
              const isLast = i === points.length - 1;
              return (
                <g key={p.x}>
                  <rect x={x} y={y} width={STEP_W} height={stepH} rx={6} className={isLast ? "fill-violet-600 dark:fill-violet-400" : "fill-violet-400/60 dark:fill-violet-500/50"} />
                  <foreignObject x={x - 8} y={Math.max(y - 24, 2)} width={STEP_W + 16} height={20}>
                    <div dir="ltr" className="flex w-full justify-center">
                      <AutoFitText text={p.formatted} steps={VALUE_STEPS} allowWrap={false} className="font-mono font-bold text-violet-700 dark:text-violet-300" />
                    </div>
                  </foreignObject>
                  <text x={x + STEP_W / 2} y={HEIGHT - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor" opacity={0.8}>
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tf("distance"), value: `${MONTHLY_DISTANCE.toLocaleString("en-US")} mi/mo` },
            { label: tf("efficiency"), value: `${EFFICIENCY} mpg` },
            { label: tf("price"), value: money(PRICE, 2) },
            { label: t("monthlyCostLabel"), value: money(MONTHLY_COST), emphasize: true, note: `× ${finalPoint.label}` },
            {
              label: td("totalCost"),
              value: finalPoint.formatted,
              emphasize: true,
              note: tw("comparisonTimes", {
                multiple: ltrIsolate((finalPoint.value / firstPoint.value).toFixed(0)),
                label: `${firstPoint.label} (${ltrIsolate(firstPoint.formatted)})`,
              }),
            },
          ]}
        />
      </div>
    </SectionCard>
  );
}
