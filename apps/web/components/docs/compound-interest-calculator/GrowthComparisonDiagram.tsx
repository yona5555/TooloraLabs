type Props = {
  labelCompound: string;
  labelSimple: string;
  caption: string;
};

const WIDTH = 560;
const HEIGHT = 300;
const PAD_LEFT = 40;
const PAD_RIGHT = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;

const PRINCIPAL = 1000;
const RATE = 0.08;
const YEARS = 20;
const POINTS = 40;

/**
 * A fixed illustrative example (not tied to whatever the visitor's tool
 * inputs happen to be, since this is reference documentation): $1,000 at 8%
 * for 20 years, compounded annually versus simple interest. The compound
 * curve's growing gap above the simple (straight-line) curve is the entire
 * point of compounding — interest earning interest, not just principal.
 */
export default function GrowthComparisonDiagram({ labelCompound, labelSimple, caption }: Props) {
  const compoundPoints: { x: number; y: number }[] = [];
  const simplePoints: { x: number; y: number }[] = [];
  for (let i = 0; i <= POINTS; i++) {
    const t = (i / POINTS) * YEARS;
    compoundPoints.push({ x: t, y: PRINCIPAL * Math.pow(1 + RATE, t) });
    simplePoints.push({ x: t, y: PRINCIPAL * (1 + RATE * t) });
  }

  const maxY = Math.max(...compoundPoints.map((p) => p.y));
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const toSvg = (x: number, y: number) => ({
    px: PAD_LEFT + (x / YEARS) * plotW,
    py: PAD_TOP + plotH - (y / maxY) * plotH,
  });

  const toPath = (points: { x: number; y: number }[]) => points.map((p) => toSvg(p.x, p.y)).map((p, i) => `${i === 0 ? "M" : "L"} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(" ");

  const compoundEnd = toSvg(YEARS, compoundPoints[compoundPoints.length - 1].y);
  const simpleEnd = toSvg(YEARS, simplePoints[simplePoints.length - 1].y);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xl">
          <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={PAD_TOP + plotH} stroke="currentColor" strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />
          <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="currentColor" strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />

          <path d={toPath(simplePoints)} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="5 4" className="text-orange-400 dark:text-orange-500" />
          <path d={toPath(compoundPoints)} fill="none" stroke="currentColor" strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" />

          <circle cx={compoundEnd.px} cy={compoundEnd.py} r={3.5} className="fill-blue-600 dark:fill-blue-400" />
          <circle cx={simpleEnd.px} cy={simpleEnd.py} r={3.5} className="fill-orange-400 dark:fill-orange-500" />

          <text x={compoundEnd.px - 8} y={compoundEnd.py - 8} textAnchor="end" fontSize={12} fontWeight={600} className="fill-blue-600 dark:fill-blue-400">
            {labelCompound}
          </text>
          <text x={simpleEnd.px - 8} y={simpleEnd.py + 16} textAnchor="end" fontSize={12} fontWeight={600} className="fill-orange-500 dark:fill-orange-400">
            {labelSimple}
          </text>

          <text x={PAD_LEFT} y={HEIGHT - 8} fontSize={10} className="fill-zinc-400 dark:fill-zinc-500">
            0
          </text>
          <text x={WIDTH - PAD_RIGHT} y={HEIGHT - 8} textAnchor="end" fontSize={10} className="fill-zinc-400 dark:fill-zinc-500">
            {YEARS}y
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
