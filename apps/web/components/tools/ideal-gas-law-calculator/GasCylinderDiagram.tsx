type GasCylinderDiagramProps = {
  volumeLiters: number;
  moles: number;
  temperatureKelvin: number;
  caption: string;
};

const WIDTH = 200;
const HEIGHT = 160;
const CYL_X = 60;
const CYL_W = 80;
const CYL_BOTTOM = 145;
const CYL_TOP_MAX = 20;
const MAX_VISUAL_VOLUME = 50;
const MIN_DOTS = 3;
const MAX_DOTS = 24;

function temperatureColor(kelvin: number): string {
  const clamped = Math.max(150, Math.min(600, kelvin));
  const t = (clamped - 150) / (600 - 150);
  const r = Math.round(59 + t * (239 - 59));
  const g = Math.round(130 + t * (68 - 130));
  const b = Math.round(246 + t * (68 - 246));
  return `rgb(${r},${g},${b})`;
}

/**
 * A gas cylinder whose piston height reflects the real computed volume,
 * whose particle count reflects the real computed moles (bounded to a
 * legible range), and whose particle color reflects the real computed
 * temperature — not a decorative illustration.
 */
export default function GasCylinderDiagram({ volumeLiters, moles, temperatureKelvin, caption }: GasCylinderDiagramProps) {
  const volumeRatio = Math.max(0.1, Math.min(1, volumeLiters / MAX_VISUAL_VOLUME));
  const cylTop = CYL_BOTTOM - (CYL_BOTTOM - CYL_TOP_MAX) * volumeRatio;
  const dotCount = Math.round(MIN_DOTS + Math.max(0, Math.min(1, moles / 5)) * (MAX_DOTS - MIN_DOTS));
  const color = temperatureColor(temperatureKelvin);

  const dots = Array.from({ length: dotCount }, (_, i) => {
    const cols = 4;
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = CYL_X + 12 + col * ((CYL_W - 24) / (cols - 1));
    const y = CYL_BOTTOM - 10 - row * 14;
    if (y < cylTop + 6) return null;
    return { x, y };
  }).filter((d): d is { x: number; y: number } => d !== null);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-[180px] text-current">
          <rect x={CYL_X} y={CYL_TOP_MAX} width={CYL_W} height={CYL_BOTTOM - CYL_TOP_MAX} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          <rect x={CYL_X + 1} y={cylTop} width={CYL_W - 2} height={CYL_BOTTOM - cylTop - 1} fill={color} opacity={0.25} />
          <line x1={CYL_X} y1={cylTop} x2={CYL_X + CYL_W} y2={cylTop} stroke="currentColor" strokeWidth={2.5} opacity={0.6} />
          {dots.map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r={3} fill={color} />
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
