type ScenarioBar = { key: string; label: string; units: number };

type BreakEvenTwoScenarioCompareBarProps = {
  scenarios: ScenarioBar[];
  caption: string;
  title: string;
};

const WIDTH = 320;
const ROW_H = 64;
const ROW_GAP = 24;
const LABEL_W = 130;

/**
 * Sized to match BreakEvenRevenueDonut's fixed 168px footprint (2 rows *
 * (64 + 24) = 176) so this bar chart carries the same visual weight as the
 * donut it sits beside — the reference section never pairs a small element
 * with a large one.
 */
export default function BreakEvenTwoScenarioCompareBar({ scenarios, caption, title }: BreakEvenTwoScenarioCompareBarProps) {
  const max = Math.max(...scenarios.map((s) => s.units), 1);
  const trackW = WIDTH - LABEL_W - 46;
  const height = scenarios.length * (ROW_H + ROW_GAP);

  return (
    <figure className="my-2 flex flex-col justify-center" style={{ minHeight: 168 }}>
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 300 }}>
          {scenarios.map((s, i) => {
            const y = i * (ROW_H + ROW_GAP);
            const w = (s.units / max) * trackW;
            return (
              <g key={s.key}>
                <text x={0} y={y + ROW_H / 2 + 5} fontSize={13} className="fill-zinc-600 dark:fill-zinc-300">
                  {s.label}
                </text>
                <rect x={LABEL_W} y={y + 8} width={trackW} height={ROW_H - 16} rx={6} className="fill-zinc-100 dark:fill-zinc-800" />
                <rect x={LABEL_W} y={y + 8} width={w} height={ROW_H - 16} rx={6} className="fill-emerald-500 dark:fill-emerald-400" />
                <text x={LABEL_W + w + 8} y={y + ROW_H / 2 + 5} fontSize={15} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
                  {s.units}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
