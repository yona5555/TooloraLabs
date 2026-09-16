import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Fixed 25% off, four real original prices — the tool's own price*discount% formula, directly, shown as vertical columns so the four price points read as a lineup. */
const DISCOUNT_PERCENT = 25;
const PRICES = [50, 100, 200, 500];

const WIDTH = 320;
const HEIGHT = 160;
const COL_WIDTH = 46;
const COL_GAP = 24;
const PAD_TOP = 24;
const PAD_BOTTOM = 40;

export default async function DiscountOriginalPriceScalingChart() {
  const t = await getTranslations("tools.discount-calculator.originalPriceScalingChart");

  const savings = PRICES.map((price) => price * (DISCOUNT_PERCENT / 100));
  const maxSavings = Math.max(...savings);
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const startX = (WIDTH - (PRICES.length * COL_WIDTH + (PRICES.length - 1) * COL_GAP)) / 2;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { percent: DISCOUNT_PERCENT })}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="mx-auto block min-w-[300px] text-current">
          <line x1={16} y1={HEIGHT - PAD_BOTTOM} x2={WIDTH - 16} y2={HEIGHT - PAD_BOTTOM} className="stroke-current opacity-20" strokeWidth={1} />
          {PRICES.map((price, i) => {
            const save = savings[i];
            const colHeight = (save / maxSavings) * plotHeight;
            const x = startX + i * (COL_WIDTH + COL_GAP);
            const y = HEIGHT - PAD_BOTTOM - colHeight;
            return (
              <g key={price}>
                <rect x={x} y={y} width={COL_WIDTH} height={colHeight} rx={6} className="fill-indigo-500/80 dark:fill-indigo-400/80" />
                <text x={x + COL_WIDTH / 2} y={y - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
                  ${save.toFixed(2)}
                </text>
                <text x={x + COL_WIDTH / 2} y={HEIGHT - PAD_BOTTOM + 18} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75}>
                  ${price}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </SectionCard>
  );
}
