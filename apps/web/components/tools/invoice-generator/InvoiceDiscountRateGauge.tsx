import RatioGauge from "@/components/tool-ui/RatioGauge";

type InvoiceDiscountRateGaugeProps = {
  valueLabel: string;
  caption: string;
  captionColorClass: string;
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

export default function InvoiceDiscountRateGauge({ valueLabel, caption, captionColorClass }: InvoiceDiscountRateGaugeProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center">
        <RatioGauge value={VALUE} domainMin={0} domainMax={30} zones={ZONES} valueLabel={valueLabel} ticks={TICKS} tickFormatter={(t) => `${t}%`} />
      </div>
      <figcaption className={`mt-2 max-w-xs text-center text-sm font-semibold ${captionColorClass}`}>{caption}</figcaption>
    </figure>
  );
}
