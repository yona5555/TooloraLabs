type ScenarioBar = { key: string; label: string; units: number };

type BreakEvenTwoScenarioCompareBarProps = {
  scenarios: ScenarioBar[];
  caption: string;
  title: string;
};

const WIDTH = 280;
const ROW_H = 32;
const ROW_GAP = 12;
const LABEL_W = 130;

export default function BreakEvenTwoScenarioCompareBar({ scenarios, caption, title }: BreakEvenTwoScenarioCompareBarProps) {
  const max = Math.max(...scenarios.map((s) => s.units), 1);
  const trackW = WIDTH - LABEL_W - 46;
  const height = scenarios.length * (ROW_H + ROW_GAP);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 260 }}>
          {scenarios.map((s, i) => {
            const y = i * (ROW_H + ROW_GAP);
            const w = (s.units / max) * trackW;
            return (
              <g key={s.key}>
                <text x={0} y={y + ROW_H / 2 + 4} fontSize={8.5} className="fill-zinc-600 dark:fill-zinc-300">
                  {s.label}
                </text>
                <rect x={LABEL_W} y={y + 4} width={trackW} height={ROW_H - 8} rx={4} className="fill-zinc-100 dark:fill-zinc-800" />
                <rect x={LABEL_W} y={y + 4} width={w} height={ROW_H - 8} rx={4} className="fill-emerald-500 dark:fill-emerald-400" />
                <text x={LABEL_W + w + 6} y={y + ROW_H / 2 + 4} fontSize={10} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
                  {s.units}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
