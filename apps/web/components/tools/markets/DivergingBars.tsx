import { changeColor } from "./fiat";

type Bar = { key: string; label: string; value: number; highlight?: boolean };

/**
 * Bars that grow left (negative, red) or right (positive, green) from a shared zero line, with the
 * signed value printed at the end of each row — period returns, currency strength, etc.
 */
export default function DivergingBars({ bars, format, testId, labelWidth = "3rem" }: { bars: Bar[]; format: (v: number) => string; testId?: string; labelWidth?: string }) {
  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 0.01);
  return (
    <ul className="space-y-1.5" dir="ltr" data-testid={testId}>
      {bars.map((b) => (
        <li key={b.key} className="grid items-center gap-2" style={{ gridTemplateColumns: `${labelWidth} 1fr 1fr 4.5rem` }}>
          <span className={`truncate font-mono text-xs font-bold ${b.highlight ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-200"}`}>{b.label}</span>
          <div className="flex h-5 justify-end">
            {b.value < 0 && <div className="h-full rounded-s bg-red-500" style={{ width: `${(Math.abs(b.value) / max) * 100}%` }} />}
          </div>
          <div className="flex h-5 border-s border-zinc-300 dark:border-zinc-600">
            {b.value >= 0 && <div className="h-full rounded-e bg-emerald-500" style={{ width: `${(b.value / max) * 100}%` }} />}
          </div>
          <span className={`text-end font-mono text-xs font-semibold ${changeColor(b.value)}`}>{format(b.value)}</span>
        </li>
      ))}
    </ul>
  );
}
