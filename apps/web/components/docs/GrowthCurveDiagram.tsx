export type GrowthPoint = { x: number; y: number };

type Props = {
  points: GrowthPoint[];
  label: string;
  caption: string;
  xUnit?: string;
};

const WIDTH = 560;
const HEIGHT = 260;
const PAD_LEFT = 40;
const PAD_RIGHT = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;

/**
 * A single curve of a value growing (or shrinking) over time — reused for
 * any tool whose result is best understood as "how this builds up across
 * the term" rather than a single static number: a retirement nest egg, a
 * deferred loan's compounding balance, and similar single-quantity-over-time
 * results. The caller supplies a fixed, illustrative point set (not a
 * visitor's live inputs), matching every other diagram on a docs page.
 */
export default function GrowthCurveDiagram({ points, label, caption, xUnit }: Props) {
  const maxX = Math.max(...points.map((p) => p.x), 1);
  const maxY = Math.max(...points.map((p) => p.y), 1);
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const toSvg = (x: number, y: number) => ({
    px: PAD_LEFT + (x / maxX) * plotW,
    py: PAD_TOP + plotH - (y / maxY) * plotH,
  });

  const path = points.map((p) => toSvg(p.x, p.y)).map((p, i) => `${i === 0 ? "M" : "L"} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${toSvg(points[points.length - 1].x, 0).px.toFixed(1)} ${PAD_TOP + plotH} L ${toSvg(0, 0).px.toFixed(1)} ${PAD_TOP + plotH} Z`;
  const end = toSvg(points[points.length - 1].x, points[points.length - 1].y);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xl">
          <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={PAD_TOP + plotH} stroke="currentColor" strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />
          <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="currentColor" strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />

          <path d={areaPath} className="fill-blue-500/10 dark:fill-blue-400/10" />
          <path d={path} fill="none" stroke="currentColor" strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" />
          <circle cx={end.px} cy={end.py} r={3.5} className="fill-blue-600 dark:fill-blue-400" />
          <text x={end.px - 8} y={end.py - 10} textAnchor="end" fontSize={12} fontWeight={600} className="fill-blue-600 dark:fill-blue-400">
            {label}
          </text>

          <text x={PAD_LEFT} y={HEIGHT - 8} fontSize={10} className="fill-zinc-400 dark:fill-zinc-500">
            0
          </text>
          <text x={WIDTH - PAD_RIGHT} y={HEIGHT - 8} textAnchor="end" fontSize={10} className="fill-zinc-400 dark:fill-zinc-500">
            {maxX}
            {xUnit ?? ""}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
