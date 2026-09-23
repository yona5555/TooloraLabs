import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduLineChart from "./EduLineChart";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";
import { ltrIsolate } from "@/lib/bidi";

/** Same annual distance & price, five real-world efficiency levels — the tool's own inverse relationship (cost = distance / efficiency * price) is a continuous curve, so a line reads it better than discrete bars. */
const ANNUAL_DISTANCE = 12000;
const PRICE = 3.5;
const EFFICIENCIES = [20, 25, 30, 35, 40];

export default async function FuelEfficiencyComparisonChart() {
  const t = await getTranslations("tools.fuel-cost-calculator.efficiencyComparisonChart");
  const tf = await getTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const td = await getTranslations("tools.fuel-cost-calculator.diagram");
  const tw = await getTranslations("tools.fuel-cost-calculator.workedExample");

  const points = EFFICIENCIES.map((mpg) => {
    const cost = (ANNUAL_DISTANCE / mpg) * PRICE;
    return { x: mpg, label: `${mpg}`, value: cost, formatted: `$${Math.round(cost).toLocaleString("en-US")}` };
  });

  const example = points[2]; // 30 mpg — the middle of the five plotted efficiency levels
  const worst = points[0]; // 20 mpg — least efficient shown, for the efficiency comparison
  const best = points[4]; // 40 mpg — most efficient shown, for both the cost comparison and the extra row

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { distance: ANNUAL_DISTANCE.toLocaleString("en-US"), price: PRICE.toFixed(2) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduLineChart points={points} ariaLabel={t("title")} lineColorClass="stroke-emerald-500 dark:stroke-emerald-400" dotColorClass="fill-emerald-500 dark:fill-emerald-400" />
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
            { label: tf("price"), value: `$${PRICE.toFixed(2)}` },
            {
              label: td("totalCost"),
              value: example.formatted,
              emphasize: true,
              note: tw("comparisonMore", {
                amount: ltrIsolate(`$${(example.value - best.value).toFixed(0)}`),
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
