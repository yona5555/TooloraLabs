import RatioGauge from "@/components/tool-ui/RatioGauge";

type SalesTaxRateGaugeProps = {
  valueLabel: string;
};

const ZONES = [
  { key: "none", from: 0, to: 1, colorClass: "stroke-zinc-400 dark:stroke-zinc-500" },
  { key: "low", from: 1, to: 6, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
  { key: "typical", from: 6, to: 9, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "high", from: 9, to: 11, colorClass: "stroke-rose-500 dark:stroke-rose-400" },
];

const TICKS = [0, 3, 6, 9, 11];

// New York City's real combined state + local rate.
const VALUE = 8.875;

/** Shared RatioGauge — its own forced dir="ltr" is correct and untouched (numeric ticks must stay LTR even on Arabic pages). */
export default function SalesTaxRateGauge({ valueLabel }: SalesTaxRateGaugeProps) {
  return (
    <div className="flex justify-center">
      <RatioGauge value={VALUE} domainMin={0} domainMax={11} zones={ZONES} valueLabel={valueLabel} ticks={TICKS} tickFormatter={(t) => `${t}%`} />
    </div>
  );
}
