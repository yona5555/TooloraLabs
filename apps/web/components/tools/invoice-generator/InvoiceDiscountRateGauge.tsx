import RatioGauge from "@/components/tool-ui/RatioGauge";

type InvoiceDiscountRateGaugeProps = {
  valueLabel: string;
};

const ZONES = [
  { key: "none", from: 0, to: 5, colorClass: "stroke-zinc-400 dark:stroke-zinc-500" },
  { key: "modest", from: 5, to: 15, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
  { key: "notable", from: 15, to: 25, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "steep", from: 25, to: 30, colorClass: "stroke-rose-500 dark:stroke-rose-400" },
];

const TICKS = [0, 10, 20, 30];

// The tool's own worked example: a 20% discount.
const VALUE = 20;

/** Shared RatioGauge — its own forced dir="ltr" is correct and untouched (numeric ticks must stay LTR even on Arabic pages). */
export default function InvoiceDiscountRateGauge({ valueLabel }: InvoiceDiscountRateGaugeProps) {
  return (
    <div className="flex justify-center">
      <RatioGauge value={VALUE} domainMin={0} domainMax={30} zones={ZONES} valueLabel={valueLabel} ticks={TICKS} tickFormatter={(t) => `${t}%`} />
    </div>
  );
}
