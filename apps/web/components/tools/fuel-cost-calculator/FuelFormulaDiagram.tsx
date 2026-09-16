import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Worked example of the tool's own formula: cost = (distance / efficiency) * price. Reference numbers, not fabricated placeholders. */
const DISTANCE = 300;
const EFFICIENCY = 30;
const PRICE = 3.5;
const FUEL_USED = DISTANCE / EFFICIENCY;
const TOTAL_COST = FUEL_USED * PRICE;

const BOX_W = 118;
const BOX_H = 60;
const GAP = 34;
const WIDTH = BOX_W * 3 + GAP * 2 + 20;
const HEIGHT = BOX_H + 20;

export default async function FuelFormulaDiagram() {
  const t = await getTranslations("tools.fuel-cost-calculator.formulaDiagram");

  const boxes = [
    { label: t("distance"), value: `${DISTANCE} mi` },
    { label: t("efficiency"), value: `${EFFICIENCY} mpg` },
    { label: t("price"), value: `$${PRICE.toFixed(2)}` },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg width={WIDTH} height={HEIGHT + 70} viewBox={`0 0 ${WIDTH} ${HEIGHT + 70}`} role="img" aria-label={t("title")} className="mx-auto block min-w-[380px] text-current">
          {boxes.map((box, i) => {
            const x = 10 + i * (BOX_W + GAP);
            return (
              <g key={box.label}>
                <rect x={x} y={10} width={BOX_W} height={BOX_H} rx={8} className="fill-blue-50 stroke-blue-400 dark:fill-blue-500/10 dark:stroke-blue-400/50" strokeWidth={1.5} />
                <text x={x + BOX_W / 2} y={34} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                  {box.label}
                </text>
                <text x={x + BOX_W / 2} y={54} textAnchor="middle" fontSize={14} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
                  {box.value}
                </text>
                {i < 2 && (
                  <text x={x + BOX_W + GAP / 2} y={46} textAnchor="middle" fontSize={16} fontWeight={700} fill="currentColor" opacity={0.5}>
                    {i === 0 ? "÷" : "×"}
                  </text>
                )}
              </g>
            );
          })}
          <text x={WIDTH / 2} y={94} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>
            {t("fuelUsedRow", { value: FUEL_USED.toFixed(1) })}
          </text>
          <line x1={20} y1={106} x2={WIDTH - 20} y2={106} stroke="currentColor" strokeWidth={1} opacity={0.2} />
          <text x={WIDTH / 2} y={126} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-emerald-600 dark:fill-emerald-400">
            {t("totalCostRow", { value: TOTAL_COST.toFixed(2) })}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
