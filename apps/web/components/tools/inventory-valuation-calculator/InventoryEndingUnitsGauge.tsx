import RatioGauge from "@/components/tool-ui/RatioGauge";

type InventoryEndingUnitsGaugeProps = {
  valueLabel: string;
  caption: string;
  captionColorClass: string;
};

const ZONES = [
  { key: "low", from: 0, to: 6, colorClass: "stroke-rose-500 dark:stroke-rose-400" },
  { key: "ok", from: 6, to: 14, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
  { key: "high", from: 14, to: 20, colorClass: "stroke-sky-500 dark:stroke-sky-400" },
];

const TICKS = [0, 5, 10, 15, 20];

// From the worked example: 20 units purchased, 12 sold → 8 remaining.
const VALUE = 8;

export default function InventoryEndingUnitsGauge({ valueLabel, caption, captionColorClass }: InventoryEndingUnitsGaugeProps) {
  return (
    <figure className="my-2">
      <div dir="ltr">
        <RatioGauge
          value={VALUE}
          domainMin={0}
          domainMax={20}
          zones={ZONES}
          valueLabel={valueLabel}
          ticks={TICKS}
          tickFormatter={(t) => `${t}`}
        />
      </div>
      <figcaption className={`mt-2 max-w-xs text-center text-sm font-semibold ${captionColorClass ?? "text-emerald-600 dark:text-emerald-400"}`}>{caption}</figcaption>
    </figure>
  );
}
