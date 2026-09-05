export type AmortizationRow = { period: number; principal: number; interest: number };

type Props = {
  rows: AmortizationRow[];
  labelPrincipal: string;
  labelInterest: string;
  caption: string;
};

const WIDTH = 560;
const HEIGHT = 260;
const PAD_LEFT = 40;
const PAD_RIGHT = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;

/**
 * A stacked-area view of every payment across an amortizing loan's term,
 * split into its principal and interest portions — the classic amortization
 * picture showing interest dominating early payments and principal
 * dominating later ones, even though the total payment itself stays flat.
 * A fixed, illustrative schedule (not a visitor's live inputs), like every
 * other diagram on a docs page.
 */
export default function AmortizationCurveDiagram({ rows, labelPrincipal, labelInterest, caption }: Props) {
  const maxPeriod = Math.max(...rows.map((r) => r.period), 1);
  const maxPayment = Math.max(...rows.map((r) => r.principal + r.interest), 1);
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const toX = (period: number) => PAD_LEFT + (period / maxPeriod) * plotW;
  const toY = (value: number) => PAD_TOP + plotH - (value / maxPayment) * plotH;

  const interestTop = rows.map((r) => ({ x: toX(r.period), y: toY(r.interest) }));
  const totalTop = rows.map((r) => ({ x: toX(r.period), y: toY(r.principal + r.interest) }));
  const baseline = toY(0);

  const interestPath = `M ${toX(rows[0].period)} ${baseline} ${interestTop.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")} L ${toX(rows[rows.length - 1].period)} ${baseline} Z`;
  const principalPath = `M ${toX(rows[0].period)} ${interestTop[0].y.toFixed(1)} ${interestTop.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")} ${[...totalTop].reverse().map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")} Z`;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xl">
          <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={PAD_TOP + plotH} stroke="currentColor" strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />
          <line x1={PAD_LEFT} y1={PAD_TOP + plotH} x2={WIDTH - PAD_RIGHT} y2={PAD_TOP + plotH} stroke="currentColor" strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />

          <path d={interestPath} className="fill-orange-400/70 dark:fill-orange-500/60" />
          <path d={principalPath} className="fill-blue-600/70 dark:fill-blue-400/60" />

          <text x={PAD_LEFT} y={HEIGHT - 8} fontSize={10} className="fill-zinc-400 dark:fill-zinc-500">
            0
          </text>
          <text x={WIDTH - PAD_RIGHT} y={HEIGHT - 8} textAnchor="end" fontSize={10} className="fill-zinc-400 dark:fill-zinc-500">
            {maxPeriod}
          </text>

          <g transform={`translate(${PAD_LEFT}, ${PAD_TOP})`}>
            <rect width={10} height={10} rx={2} className="fill-blue-600/70 dark:fill-blue-400/60" />
            <text x={16} y={9} fontSize={11} className="fill-zinc-600 dark:fill-zinc-300">
              {labelPrincipal}
            </text>
            <rect x={130} width={10} height={10} rx={2} className="fill-orange-400/70 dark:fill-orange-500/60" />
            <text x={146} y={9} fontSize={11} className="fill-zinc-600 dark:fill-zinc-300">
              {labelInterest}
            </text>
          </g>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
