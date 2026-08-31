type RatioBarProps = {
  label: string;
  valuePercent: number;
  capPercent: number;
  valueLabel: string;
  capLabel: string;
  isOverCap?: boolean;
};

/**
 * Horizontal bar comparing a computed percentage against a reference cap
 * (a lending guideline, a recommended max, etc.) — the track scales to fit
 * both the value and the cap comfortably rather than a fixed 0-100% range,
 * so a 15% car-payment guideline and a 36% DTI guideline both read clearly.
 */
export default function RatioBar({ label, valuePercent, capPercent, valueLabel, capLabel, isOverCap }: RatioBarProps) {
  // A small epsilon absorbs floating-point noise from upstream calculations that land a value
  // *exactly* at its cap by construction (e.g. the binding constraint in a min()-based solve) —
  // without it, harmless float imprecision (28.0000000001 vs a 28 cap) reads as "over guideline".
  const overCap = isOverCap ?? valuePercent > capPercent + 0.05;
  const trackMax = Math.max(capPercent * 1.25, valuePercent * 1.1, 1);
  const fillPct = Math.min((Math.max(valuePercent, 0) / trackMax) * 100, 100);
  const capPositionPct = Math.min((capPercent / trackMax) * 100, 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
        <span dir="ltr" className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {valueLabel}
        </span>
      </div>
      <div dir="ltr" className="relative mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${overCap ? "bg-red-500 dark:bg-red-500" : "bg-blue-600 dark:bg-blue-400"}`} style={{ width: `${fillPct}%` }} />
        <div className="absolute top-0 h-full w-0.5 bg-zinc-500 dark:bg-zinc-300" style={{ left: `${capPositionPct}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">{capLabel}</p>
    </div>
  );
}
