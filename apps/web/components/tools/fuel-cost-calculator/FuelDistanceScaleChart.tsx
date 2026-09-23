import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";

/**
 * Same efficiency & price, four real trip distances spanning three orders of magnitude
 * (a commute vs. a full year of driving) — shown as a log-scaled horizontal axis with
 * markers rather than a bar chart, since the point is "where does your trip sit on the
 * distance spectrum," not a value-for-value comparison.
 */
const EFFICIENCY = 30;
const PRICE = 3.5;
const DISTANCES = [
  { key: "commute", miles: 20 },
  { key: "weekendTrip", miles: 150 },
  { key: "roadTrip", miles: 500 },
  { key: "yearly", miles: 12000 },
];

const WIDTH = 360;
const HEIGHT = 130;
const AXIS_Y = 70;
const PAD_LEFT = 20;
const PAD_RIGHT = 20;

export default async function FuelDistanceScaleChart() {
  const t = await getTranslations("tools.fuel-cost-calculator.distanceScaleChart");
  const tf = await getTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const td = await getTranslations("tools.fuel-cost-calculator.diagram");
  const tw = await getTranslations("tools.fuel-cost-calculator.workedExample");

  const marks = DISTANCES.map((d) => {
    const cost = (d.miles / EFFICIENCY) * PRICE;
    return { key: d.key, miles: d.miles, label: t(`labels.${d.key}`, { miles: d.miles.toLocaleString("en-US") }), formatted: `$${cost.toFixed(0)}` };
  });

  const logMin = Math.log10(marks[0].miles);
  const logMax = Math.log10(marks[marks.length - 1].miles);
  const logRange = Math.max(logMax - logMin, 1);
  const xFor = (miles: number) => PAD_LEFT + ((Math.log10(miles) - logMin) / logRange) * (WIDTH - PAD_LEFT - PAD_RIGHT);

  const example = marks[2]; // "roadTrip" (500 mi) — a clean, representative mid-range point already plotted on the axis

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { efficiency: EFFICIENCY, price: PRICE.toFixed(2) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="block min-w-[320px] text-current">
            <line x1={PAD_LEFT} y1={AXIS_Y} x2={WIDTH - PAD_RIGHT} y2={AXIS_Y} className="stroke-teal-400 dark:stroke-teal-500" strokeWidth={3} strokeLinecap="round" />
            {marks.map((m, i) => {
              const x = xFor(m.miles);
              const above = i % 2 === 0;
              const anchor = i === 0 ? "start" : i === marks.length - 1 ? "end" : "middle";
              return (
                <g key={m.key}>
                  <circle cx={x} cy={AXIS_Y} r={6} className="fill-teal-500 dark:fill-teal-400" />
                  <line x1={x} y1={AXIS_Y} x2={x} y2={above ? AXIS_Y - 20 : AXIS_Y + 20} className="stroke-teal-400/60 dark:stroke-teal-500/60" strokeWidth={1.5} />
                  <text x={x} y={above ? AXIS_Y - 26 : AXIS_Y + 36} textAnchor={anchor} fontSize={10} fill="currentColor" opacity={0.75}>
                    {m.label}
                  </text>
                  <text x={x} y={above ? AXIS_Y - 14 : AXIS_Y + 24} textAnchor={anchor} fontSize={11} fontWeight={700} className="fill-teal-600 dark:fill-teal-300">
                    {m.formatted}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tf("distance"), value: `${example.miles.toLocaleString("en-US")} mi` },
            { label: tf("efficiency"), value: `${EFFICIENCY} mpg` },
            { label: tf("price"), value: `$${PRICE.toFixed(2)}` },
            { label: td("totalCost"), value: example.formatted, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
