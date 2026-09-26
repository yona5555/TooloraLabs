import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import TipWorkedExampleNote from "./TipWorkedExampleNote";

/** Worked example of the tool's own formula: bill * tip% = tip amount, then + bill = total. Real numbers. */
const BILL = 85;
const TIP_PERCENT = 18;
const TIP_AMOUNT = BILL * (TIP_PERCENT / 100);
const TOTAL = BILL + TIP_AMOUNT;

const STOP_ZONE_W = 96;
const ZONE_GAP = 16;
const RESULT_ZONE_W = 150;
const RIBBON_TOP = 20;
const RIBBON_BOTTOM = 80;
const ARROWHEAD_W = 28;
const RIBBON_BODY_END = STOP_ZONE_W * 2 + ZONE_GAP + RESULT_ZONE_W;
const WIDTH = RIBBON_BODY_END + ARROWHEAD_W;
const HEIGHT = 100;

/**
 * §31 type #2 (Flow Arrow with Embedded Numbers): one continuous connected
 * shape carrying the sequential values, not separate bordered boxes with an
 * operator symbol floating between them — same fix already applied to
 * Fuel Cost Calculator's FuelFormulaDiagram (the reference for this exact
 * pattern), ported here since this diagram had the banned box+symbol layout.
 */
export default async function TipFormulaDiagram() {
  const t = await getTranslations("tools.tip-calculator.formulaDiagram");
  const tRoot = await getTranslations("tools.tip-calculator");

  const stops = [
    { label: t("bill"), value: `$${BILL.toFixed(2)}`, zoneStart: 0 },
    { label: t("tipPercent"), value: `${TIP_PERCENT}%`, zoneStart: STOP_ZONE_W },
  ];
  const resultZoneStart = STOP_ZONE_W * 2 + ZONE_GAP;

  const ribbonPath = `M 0 ${RIBBON_TOP} L ${RIBBON_BODY_END} ${RIBBON_TOP} L ${WIDTH} ${(RIBBON_TOP + RIBBON_BOTTOM) / 2} L ${RIBBON_BODY_END} ${RIBBON_BOTTOM} L 0 ${RIBBON_BOTTOM} Z`;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("title")} className="mx-auto block min-w-[300px] text-current">
            <defs>
              <linearGradient id="tipFormulaRibbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="currentColor" className="text-blue-400 dark:text-blue-500" stopOpacity={0.85} />
                <stop offset="100%" stopColor="currentColor" className="text-emerald-500 dark:text-emerald-400" stopOpacity={0.95} />
              </linearGradient>
            </defs>
            <path d={ribbonPath} fill="url(#tipFormulaRibbon)" />

            {stops.map((stop) => (
              <g key={stop.label}>
                <text x={stop.zoneStart + STOP_ZONE_W / 2} y={RIBBON_TOP + 22} textAnchor="middle" fontSize={9} fontWeight={600} fill="white" opacity={0.85}>
                  {stop.label}
                </text>
                <text x={stop.zoneStart + STOP_ZONE_W / 2} y={RIBBON_TOP + 40} textAnchor="middle" fontSize={13} fontWeight={700} fill="white" fontFamily="monospace">
                  {stop.value}
                </text>
              </g>
            ))}

            <text x={resultZoneStart + RESULT_ZONE_W / 2} y={RIBBON_TOP + 22} textAnchor="middle" fontSize={9} fontWeight={600} fill="white" opacity={0.85}>
              {tRoot("workedExampleTitle")}
            </text>
            <text x={resultZoneStart + RESULT_ZONE_W / 2} y={RIBBON_TOP + 44} textAnchor="middle" fontSize={17} fontWeight={700} fill="white" fontFamily="monospace">
              ${TOTAL.toFixed(2)}
            </text>
          </svg>
        </div>
        <TipWorkedExampleNote
          title={tRoot("workedExampleTitle")}
          rows={[
            { label: t("bill"), value: `$${BILL.toFixed(2)}` },
            { label: t("tipPercent"), value: `${TIP_PERCENT}%` },
            { label: t("tipAmount"), value: `$${TIP_AMOUNT.toFixed(2)}` },
            { label: t("totalLabel"), value: `$${TOTAL.toFixed(2)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
