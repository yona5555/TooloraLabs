import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Same $120 original price, four real discount percentages — the tool's own price - price*discount% formula, shown as a scale of final prices rather than a bar list. */
const PRICE = 120;
const PERCENTS = [10, 20, 30, 40];

const WIDTH = 340;
const HEIGHT = 130;
const AXIS_Y = 70;
const PAD_LEFT = 20;
const PAD_RIGHT = 20;

export default async function DiscountPercentComparisonChart() {
  const t = await getTranslations("tools.discount-calculator.percentComparisonChart");

  const marks = PERCENTS.map((pct) => {
    const final = PRICE * (1 - pct / 100);
    return { pct, label: `${pct}%`, formatted: `$${final.toFixed(2)}` };
  });

  const xFor = (i: number) => PAD_LEFT + (i / (marks.length - 1)) * (WIDTH - PAD_LEFT - PAD_RIGHT);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { price: PRICE.toFixed(2) })}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="block min-w-[300px] text-current">
          <line x1={PAD_LEFT} y1={AXIS_Y} x2={WIDTH - PAD_RIGHT} y2={AXIS_Y} className="stroke-teal-400 dark:stroke-teal-500" strokeWidth={3} strokeLinecap="round" />
          {marks.map((m, i) => {
            const x = xFor(i);
            const above = i % 2 === 0;
            const anchor = i === 0 ? "start" : i === marks.length - 1 ? "end" : "middle";
            return (
              <g key={m.pct}>
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
    </SectionCard>
  );
}
