"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertAmount } from "@/lib/currency";
import AutoFitText from "@/components/tool-ui/AutoFitText";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";
import SectionCard from "@/components/tool-ui/SectionCard";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";

/** Worked example of the tool's own formula: cost = (distance / efficiency) * price. Reference numbers, not fabricated placeholders. */
const DISTANCE = 300;
const EFFICIENCY = 30;
const PRICE = 3.5;
const FUEL_USED = DISTANCE / EFFICIENCY;
const TOTAL_COST = FUEL_USED * PRICE;

// Explicit, non-overlapping-by-construction zones rather than percentage
// formulas: a first version positioned stops/result by percentage of a
// shared width, and a longer converted currency value ("EGP 171.50" vs.
// "$3.50") pushed the Price stop's own box into the Total Cost box's
// region, rendering them visually overlapping/unreadable. Each zone below
// has a fixed pixel width with a real gap to its neighbor, so no value
// length can make two zones collide.
const STOP_ZONE_W = 88;
const ZONE_GAP = 16;
const RESULT_ZONE_W = 170;
const RIBBON_TOP = 30;
const RIBBON_BOTTOM = 90;
const ARROWHEAD_W = 30;
const RIBBON_BODY_END = STOP_ZONE_W * 3 + ZONE_GAP + RESULT_ZONE_W;
const WIDTH = RIBBON_BODY_END + ARROWHEAD_W;
const HEIGHT = 130;
const STOP_STEPS = ["text-sm", "text-xs"];
const RESULT_STEPS = ["text-lg", "text-base", "text-sm"];

/**
 * §31 Type #2 (Flow Arrow with Embedded Numbers): one continuous connected
 * shape carrying the sequential values, not separate bordered boxes with an
 * operator floating between them. Distance/Efficiency/Price sit directly on
 * the ribbon in fixed-width zones as it runs toward the arrowhead; the
 * arrowhead itself opens into the final Total Cost value, sized up and set
 * apart in its own dedicated zone.
 */
export default function FuelFormulaDiagram() {
  const t = useTranslations("tools.fuel-cost-calculator.formulaDiagram");
  const td = useTranslations("tools.fuel-cost-calculator.diagram");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";
  const money = (usd: number) => formatLocalizedNumber(convertAmount(usd, "USD", currency), digitStyle, { style: "currency", currency, maximumFractionDigits: 2 });

  const stops = [
    { label: t("distance"), value: `${DISTANCE} mi`, zoneStart: 0 },
    { label: t("efficiency"), value: `${EFFICIENCY} mpg`, zoneStart: STOP_ZONE_W },
    { label: t("price"), value: money(PRICE), zoneStart: STOP_ZONE_W * 2 },
  ];
  const resultZoneStart = STOP_ZONE_W * 3 + ZONE_GAP;

  const doubleDistanceCost = (DISTANCE * 2) / EFFICIENCY * PRICE;
  const doublePriceCost = FUEL_USED * (PRICE * 2);

  const ribbonPath = `M 0 ${RIBBON_TOP} L ${RIBBON_BODY_END} ${RIBBON_TOP} L ${WIDTH} ${(RIBBON_TOP + RIBBON_BOTTOM) / 2} L ${RIBBON_BODY_END} ${RIBBON_BOTTOM} L 0 ${RIBBON_BOTTOM} Z`;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { price: money(PRICE) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="mx-auto block min-w-[340px] text-current">
            <defs>
              <linearGradient id="fuelFormulaRibbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="currentColor" className="text-blue-400 dark:text-blue-500" stopOpacity={0.85} />
                <stop offset="100%" stopColor="currentColor" className="text-emerald-500 dark:text-emerald-400" stopOpacity={0.95} />
              </linearGradient>
            </defs>
            <path d={ribbonPath} fill="url(#fuelFormulaRibbon)" />

            {stops.map((stop) => (
              <foreignObject key={stop.label} x={stop.zoneStart + 2} y={RIBBON_TOP - 2} width={STOP_ZONE_W - 4} height={RIBBON_BOTTOM - RIBBON_TOP + 4}>
                <div dir="ltr" className="flex h-full w-full flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-medium text-white/85">{stop.label}</span>
                  <AutoFitText text={stop.value} steps={STOP_STEPS} allowWrap={false} className="font-mono font-bold text-white" />
                </div>
              </foreignObject>
            ))}

            <foreignObject x={resultZoneStart} y={RIBBON_TOP - 8} width={RESULT_ZONE_W} height={RIBBON_BOTTOM - RIBBON_TOP + 16}>
              <div dir="ltr" className="flex h-full w-full flex-col items-center justify-center text-center">
                <span className="text-[9px] font-medium text-white/85">{td("totalCost")}</span>
                <AutoFitText text={money(TOTAL_COST)} steps={RESULT_STEPS} allowWrap={false} className="font-mono font-bold text-white" />
              </div>
            </foreignObject>

            <text x={STOP_ZONE_W} y={HEIGHT - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor" opacity={0.55}>
              ÷
            </text>
            <text x={STOP_ZONE_W * 2} y={HEIGHT - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor" opacity={0.55}>
              ×
            </text>
          </svg>
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: t("distance"), value: `${DISTANCE} mi` },
            { label: t("efficiency"), value: `${EFFICIENCY} mpg` },
            { label: t("price"), value: money(PRICE) },
            { label: td("fuelUsed"), value: `${FUEL_USED.toFixed(1)} gal` },
            { label: td("totalCost"), value: money(TOTAL_COST), emphasize: true },
            { label: t("ifDistanceDoubledLabel"), value: money(doubleDistanceCost) },
            { label: t("ifPriceDoubledLabel", { price: money(PRICE * 2) }), value: money(doublePriceCost) },
          ]}
        />
      </div>
    </SectionCard>
  );
}
