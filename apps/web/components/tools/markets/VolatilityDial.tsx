import SemiGauge from "./SemiGauge";

type Props = {
  value: number;
  limits: { low: number; medium: number };
  max: number;
  valueText: string;
  zoneLabels: { low: string; medium: string; high: string };
  ariaLabel: string;
};

/** Annualized volatility on a calm / normal / stormy half-dial, with its value and zone legend. */
export default function VolatilityDial({ value, limits, max, valueText, zoneLabels, ariaLabel }: Props) {
  const zone = value < limits.low ? "low" : value < limits.medium ? "medium" : "high";
  return (
    <div className="flex flex-col items-center">
      <SemiGauge
        value={value}
        max={max}
        zones={[
          { to: limits.low, className: "stroke-emerald-500" },
          { to: limits.medium, className: "stroke-amber-400" },
          { to: max, className: "stroke-red-500" },
        ]}
        ticks={[0, limits.low, limits.medium, max].map((v) => ({ value: v, label: `${v}%` }))}
        ariaLabel={ariaLabel}
        testId="volatility-gauge"
      />
      <p className="-mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100" dir="ltr" data-testid="volatility-value">
        {valueText}
      </p>
      <p className={`text-sm font-semibold ${zone === "low" ? "text-emerald-600" : zone === "medium" ? "text-amber-600" : "text-red-600"}`}>{zoneLabels[zone]}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />{zoneLabels.low} &lt;{limits.low}%</span>
        <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-amber-400" />{zoneLabels.medium}</span>
        <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-red-500" />{zoneLabels.high} &gt;{limits.medium}%</span>
      </div>
    </div>
  );
}
