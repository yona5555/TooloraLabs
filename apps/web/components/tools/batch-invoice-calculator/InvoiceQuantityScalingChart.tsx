import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Same $85 unit price, four real quantities — the tool's own quantity * price line-total formula, shown as a scale rather than a bar list. */
const UNIT_PRICE = 85;
const QUANTITIES = [1, 5, 12, 20];

const WIDTH = 340;
const HEIGHT = 130;
const AXIS_Y = 70;
const PAD_LEFT = 20;
const PAD_RIGHT = 20;

export default async function InvoiceQuantityScalingChart() {
  const t = await getTranslations("tools.batch-invoice-calculator.quantityScalingChart");
  const tRoot = await getTranslations("tools.batch-invoice-calculator");

  const marks = QUANTITIES.map((qty) => {
    const total = qty * UNIT_PRICE;
    return { qty, label: t("units", { count: qty }), formatted: `$${total.toFixed(2)}` };
  });

  const xFor = (i: number) => PAD_LEFT + (i / (marks.length - 1)) * (WIDTH - PAD_LEFT - PAD_RIGHT);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption", { price: UNIT_PRICE.toFixed(2) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1 overflow-x-auto" dir="ltr">
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="block min-w-[300px] text-current">
            <line x1={PAD_LEFT} y1={AXIS_Y} x2={WIDTH - PAD_RIGHT} y2={AXIS_Y} className="stroke-teal-400 dark:stroke-teal-500" strokeWidth={3} strokeLinecap="round" />
            {marks.map((m, i) => {
              const x = xFor(i);
              const above = i % 2 === 0;
              const anchor = i === 0 ? "start" : i === marks.length - 1 ? "end" : "middle";
              return (
                <g key={m.qty}>
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
        <div dir="ltr" className="shrink-0 rounded-xl bg-zinc-50 p-4 lg:w-56 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{tRoot("workedExampleTitle")}</p>
          <dl className="mt-2 space-y-2 text-sm">
            {marks.map((m, i) => (
              <div key={m.qty} className={`flex items-center justify-between gap-3 ${i === marks.length - 1 ? "border-t border-zinc-200 pt-2 dark:border-zinc-700" : ""}`}>
                <dt className={i === marks.length - 1 ? "font-semibold text-zinc-700 dark:text-zinc-200" : "text-zinc-600 dark:text-zinc-300"}>{m.label}</dt>
                <dd className={`font-mono font-semibold ${i === marks.length - 1 ? "text-lg font-bold text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}>{m.formatted}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}
