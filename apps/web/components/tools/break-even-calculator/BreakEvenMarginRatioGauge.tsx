import RatioGauge from "@/components/tool-ui/RatioGauge";

type BreakEvenMarginRatioGaugeProps = {
  valueLabel: string;
  caption: string;
  captionColorClass: string;
};

const ZONES = [
  { key: "thin", from: 0, to: 30, colorClass: "stroke-rose-500 dark:stroke-rose-400" },
  { key: "healthy", from: 30, to: 70, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
  { key: "rich", from: 70, to: 100, colorClass: "stroke-sky-500 dark:stroke-sky-400" },
];

const TICKS = [0, 25, 50, 75, 100];

// $30 margin / $50 price = 60%, from the tool's own worked example.
const VALUE = 60;

export default function BreakEvenMarginRatioGauge({ valueLabel, caption, captionColorClass }: BreakEvenMarginRatioGaugeProps) {
  return (
    <figure className="my-2">
      <div dir="ltr">
        <RatioGauge
          value={VALUE}
          domainMin={0}
          domainMax={100}
          zones={ZONES}
          valueLabel={valueLabel}
          caption={caption}
          captionColorClass={captionColorClass}
          ticks={TICKS}
          tickFormatter={(t) => `${t}%`}
        />
      </div>
    </figure>
  );
}
