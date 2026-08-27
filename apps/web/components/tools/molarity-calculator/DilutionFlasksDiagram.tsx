type DilutionFlasksDiagramProps = {
  concentration1: number;
  volume1: number;
  concentration2: number;
  volume2: number;
  label1: string;
  label2: string;
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 130;
const FLASK_W = 70;
const FLASK_H = 80;
const FLASK_TOP = 20;
const FLASK1_X = 60;
const FLASK2_X = 210;

function FlaskShape({
  x,
  concentration,
  maxConcentration,
  volume,
  maxVolume,
}: {
  x: number;
  concentration: number;
  maxConcentration: number;
  volume: number;
  maxVolume: number;
}) {
  const fillRatio = maxVolume > 0 ? Math.max(0.12, Math.min(1, volume / maxVolume)) : 0.12;
  const fillHeight = FLASK_H * fillRatio;
  const opacity = maxConcentration > 0 ? Math.max(0.15, Math.min(0.95, concentration / maxConcentration)) : 0.15;

  return (
    <g>
      <rect
        x={x}
        y={FLASK_TOP}
        width={FLASK_W}
        height={FLASK_H}
        rx={4}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.4}
      />
      <rect
        x={x + 1.5}
        y={FLASK_TOP + FLASK_H - fillHeight}
        width={FLASK_W - 3}
        height={fillHeight - 2}
        fill="#2563eb"
        opacity={opacity}
      />
    </g>
  );
}

/**
 * Two flasks whose liquid height reflects the real computed volume and whose
 * fill opacity reflects the real computed concentration — a dynamic visual
 * of the dilution, not a decorative illustration.
 */
export default function DilutionFlasksDiagram({
  concentration1,
  volume1,
  concentration2,
  volume2,
  label1,
  label2,
  caption,
}: DilutionFlasksDiagramProps) {
  const maxConcentration = Math.max(concentration1, concentration2);
  const maxVolume = Math.max(volume1, volume2);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <FlaskShape x={FLASK1_X} concentration={concentration1} maxConcentration={maxConcentration} volume={volume1} maxVolume={maxVolume} />
          <FlaskShape x={FLASK2_X} concentration={concentration2} maxConcentration={maxConcentration} volume={volume2} maxVolume={maxVolume} />
          <text x={FLASK1_X + FLASK_W / 2} y={FLASK_TOP + FLASK_H + 18} fontSize={10} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            {label1}
          </text>
          <text x={FLASK2_X + FLASK_W / 2} y={FLASK_TOP + FLASK_H + 18} fontSize={10} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            {label2}
          </text>
          <text x={(FLASK1_X + FLASK2_X + FLASK_W) / 2} y={FLASK_TOP + FLASK_H / 2 + 4} fontSize={14} textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500">
            →
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
