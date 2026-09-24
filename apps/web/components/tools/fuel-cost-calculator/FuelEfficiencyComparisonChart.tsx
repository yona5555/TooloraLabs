"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertAmount } from "@/lib/currency";
import AutoFitText from "@/components/tool-ui/AutoFitText";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";
import SectionCard from "@/components/tool-ui/SectionCard";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import { ltrIsolate } from "@/lib/bidi";

/** Same annual distance & price, five real-world efficiency levels — the tool's own inverse relationship (cost = distance / efficiency * price). */
const ANNUAL_DISTANCE = 12000;
const PRICE = 3.5;
const EFFICIENCIES = [20, 25, 30, 35, 40];

const COL_WIDTH = 48;
const COL_GAP = 20;
const PAD_TOP = 30;
const PAD_BOTTOM = 34;
// +50 (not +20): each bar's value label overhangs its own column by 15px on
// either side (COL_WIDTH+30 wide, centered), so the outermost columns need
// that overhang included in the canvas width too — a first version only
// padded for the bars themselves and the last label's foreignObject spilled
// 5px past the SVG's right edge.
const WIDTH = EFFICIENCIES.length * COL_WIDTH + (EFFICIENCIES.length - 1) * COL_GAP + 50;
const HEIGHT = 170;
const VALUE_STEPS = ["text-xs"];

/**
 * §31 Type #1 (Labeled Bar Chart): 5 discrete real-world efficiency levels
 * are categorical data points, not a continuous trend over time, so bars —
 * each carrying its own bold cost value, always visible — fit this data
 * better than a bare line with dots, which was the previous design here.
 */
export default function FuelEfficiencyComparisonChart() {
  const t = useTranslations("tools.fuel-cost-calculator.efficiencyComparisonChart");
  const tf = useTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const td = useTranslations("tools.fuel-cost-calculator.diagram");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";
  const money = (usd: number, maximumFractionDigits = 0) =>
    formatLocalizedNumber(convertAmount(usd, "USD", currency), digitStyle, { style: "currency", currency, maximumFractionDigits });

  const points = EFFICIENCIES.map((mpg) => {
    const cost = (ANNUAL_DISTANCE / mpg) * PRICE;
    return { x: mpg, label: `${mpg}`, value: cost, formatted: money(cost) };
  });

  const example = points[2]; // 30 mpg — the middle of the five plotted efficiency levels
  const worst = points[0]; // 20 mpg — least efficient shown, for the efficiency comparison
  const best = points[4]; // 40 mpg — most efficient shown, for both the cost comparison and the extra row
  const maxValue = Math.max(...points.map((p) => p.value));
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const startX = (WIDTH - (EFFICIENCIES.length * COL_WIDTH + (EFFICIENCIES.length - 1) * COL_GAP)) / 2;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { distance: ANNUAL_DISTANCE.toLocaleString("en-US"), price: money(PRICE, 2) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="mx-auto block min-w-[300px] text-current">
            <line x1={10} y1={HEIGHT - PAD_BOTTOM} x2={WIDTH - 10} y2={HEIGHT - PAD_BOTTOM} className="stroke-current opacity-20" strokeWidth={1} />
            {points.map((p, i) => {
              const colHeight = (p.value / maxValue) * plotHeight;
              const x = startX + i * (COL_WIDTH + COL_GAP);
              const y = HEIGHT - PAD_BOTTOM - colHeight;
              const isBest = p.x === best.x;
              return (
                <g key={p.x}>
                  <rect x={x} y={y} width={COL_WIDTH} height={colHeight} rx={6} className={isBest ? "fill-emerald-500 dark:fill-emerald-400" : "fill-emerald-400/60 dark:fill-emerald-500/50"} />
                  <foreignObject x={x - 15} y={Math.max(y - 26, 2)} width={COL_WIDTH + 30} height={22}>
                    <div dir="ltr" className="flex w-full justify-center">
                      <AutoFitText text={p.formatted} steps={VALUE_STEPS} allowWrap={false} className="font-mono font-bold text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </foreignObject>
                  <text x={x + COL_WIDTH / 2} y={HEIGHT - PAD_BOTTOM + 18} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor" opacity={0.8}>
                    {p.x} mpg
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tf("distance"), value: `${ANNUAL_DISTANCE.toLocaleString("en-US")} mi` },
            {
              label: tf("efficiency"),
              value: `${example.x} mpg`,
              note: tw("comparisonMore", { amount: ltrIsolate(`${(((example.x - worst.x) / worst.x) * 100).toFixed(0)}%`), label: ltrIsolate(`${worst.x} mpg`) }),
            },
            { label: tf("price"), value: money(PRICE, 2) },
            {
              label: td("totalCost"),
              value: example.formatted,
              emphasize: true,
              note: tw("comparisonMore", {
                amount: ltrIsolate(money(example.value - best.value)),
                label: ltrIsolate(`${best.x} mpg (${best.formatted})`),
              }),
            },
            { label: t("bestCaseLabel", { mpg: best.x }), value: best.formatted },
          ]}
        />
      </div>
    </SectionCard>
  );
}
