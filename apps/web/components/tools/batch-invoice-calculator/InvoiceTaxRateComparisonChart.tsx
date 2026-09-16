import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Same $1,093.50 subtotal, four real tax-rate scenarios — the tool's own subtotal + tax formula, shown as vertical columns so the four scenarios read as a lineup. */
const SUBTOTAL = 1093.5;
const RATES = [0, 5, 8.5, 10];

const WIDTH = 320;
const HEIGHT = 160;
const COL_WIDTH = 46;
const COL_GAP = 24;
const PAD_TOP = 24;
const PAD_BOTTOM = 40;

export default async function InvoiceTaxRateComparisonChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.taxRateComparisonChart");

  const totals = RATES.map((rate) => SUBTOTAL * (1 + rate / 100));
  const maxTotal = Math.max(...totals);
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const startX = (WIDTH - (RATES.length * COL_WIDTH + (RATES.length - 1) * COL_GAP)) / 2;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { subtotal: SUBTOTAL.toFixed(2) })}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="mx-auto block min-w-[300px] text-current">
          <line x1={16} y1={HEIGHT - PAD_BOTTOM} x2={WIDTH - 16} y2={HEIGHT - PAD_BOTTOM} className="stroke-current opacity-20" strokeWidth={1} />
          {RATES.map((rate, i) => {
            const total = totals[i];
            const colHeight = (total / maxTotal) * plotHeight;
            const x = startX + i * (COL_WIDTH + COL_GAP);
            const y = HEIGHT - PAD_BOTTOM - colHeight;
            return (
              <g key={rate}>
                <rect x={x} y={y} width={COL_WIDTH} height={colHeight} rx={6} className="fill-indigo-500/80 dark:fill-indigo-400/80" />
                <text x={x + COL_WIDTH / 2} y={y - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
                  ${total.toFixed(2)}
                </text>
                <text x={x + COL_WIDTH / 2} y={HEIGHT - PAD_BOTTOM + 18} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75}>
                  {rate}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </SectionCard>
  );
}
