type TrajectoryDiagramProps = {
  speed: number;
  angle: number;
  height: number;
  gravity: number;
  timeOfFlight: number;
  maxHeight: number;
  range: number;
  launchLabel: string;
  peakLabel: string;
  landingLabel: string;
  caption: string;
};

const WIDTH = 300;
const HEIGHT = 150;
const MARGIN_LEFT = 34;
const MARGIN_RIGHT = 16;
const MARGIN_TOP = 16;
const MARGIN_BOTTOM = 24;
const PLOT_WIDTH = WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const PLOT_HEIGHT = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
const SAMPLES = 36;
const GROUND_Y = HEIGHT - MARGIN_BOTTOM;

const DEG_TO_RAD = Math.PI / 180;

/**
 * A real parabolic trajectory — sample points are computed from the actual
 * launch speed, angle, height, and gravity (and scaled to the actual
 * computed max height and range), not a decorative illustration.
 */
export default function TrajectoryDiagram({
  speed,
  angle,
  height,
  gravity,
  timeOfFlight,
  maxHeight,
  range,
  launchLabel,
  peakLabel,
  landingLabel,
  caption,
}: TrajectoryDiagramProps) {
  const angleRad = angle * DEG_TO_RAD;
  const vx = speed * Math.cos(angleRad);
  const vy = speed * Math.sin(angleRad);

  const maxX = Math.max(range, 1e-6);
  const maxY = Math.max(maxHeight, 1e-6);

  const toSvg = (x: number, y: number) => ({
    px: MARGIN_LEFT + (x / maxX) * PLOT_WIDTH,
    py: GROUND_Y - (y / maxY) * PLOT_HEIGHT,
  });

  const points: { px: number; py: number }[] = [];
  const steps = timeOfFlight > 0 ? SAMPLES : 0;
  for (let i = 0; i <= steps; i++) {
    const t = (i / SAMPLES) * timeOfFlight;
    const x = vx * t;
    const y = height + vy * t - 0.5 * gravity * t * t;
    points.push(toSvg(x, Math.max(0, y)));
  }

  const launch = toSvg(0, height);
  const peakT = gravity > 0 ? Math.max(0, vy / gravity) : 0;
  const peak = toSvg(vx * peakT, maxHeight);
  const landing = toSvg(range, 0);

  const pathD =
    points.length > 0
      ? `M ${points.map((p) => `${p.px.toFixed(2)},${p.py.toFixed(2)}`).join(" L ")}`
      : `M ${launch.px.toFixed(2)},${launch.py.toFixed(2)}`;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <line x1={MARGIN_LEFT} y1={GROUND_Y} x2={WIDTH - MARGIN_RIGHT} y2={GROUND_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />

          <path d={pathD} fill="none" stroke="currentColor" strokeWidth={2} className="text-blue-600 dark:text-blue-400" />

          <circle cx={launch.px} cy={launch.py} r={3.5} className="fill-blue-600 dark:fill-blue-400" />
          <circle cx={peak.px} cy={peak.py} r={3} className="fill-orange-500 dark:fill-orange-400" />
          <circle cx={landing.px} cy={landing.py} r={3.5} className="fill-zinc-500 dark:fill-zinc-400" />

          <text x={launch.px} y={launch.py - 8} fontSize={9} textAnchor="start" className="fill-blue-600 dark:fill-blue-400">
            {launchLabel}
          </text>
          <text x={peak.px} y={Math.max(9, peak.py - 8)} fontSize={9} textAnchor="middle" className="fill-orange-500 dark:fill-orange-400">
            {peakLabel}
          </text>
          <text x={landing.px} y={GROUND_Y + 14} fontSize={9} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
            {landingLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
