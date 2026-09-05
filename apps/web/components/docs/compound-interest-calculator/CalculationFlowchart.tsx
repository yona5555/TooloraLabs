type Props = {
  steps: string[];
  caption: string;
};

const WIDTH = 640;
const BOX_HEIGHT = 56;
const BOX_WIDTH = 560;
const GAP = 40;
const PADDING_TOP = 20;

/**
 * A vertical flowchart of the engine's actual month-by-month loop (not the
 * closed-form formula) — each box is one repeated step, with the loop-back
 * arrow on step 2 showing that steps 2-3 repeat for every month of the term
 * before the final deflation step runs once at the end.
 */
export default function CalculationFlowchart({ steps, caption }: Props) {
  const height = PADDING_TOP * 2 + steps.length * BOX_HEIGHT + (steps.length - 1) * GAP + 30;
  const centerX = WIDTH / 2;

  const boxTop = (i: number) => PADDING_TOP + i * (BOX_HEIGHT + GAP);
  const boxCenterY = (i: number) => boxTop(i) + BOX_HEIGHT / 2;

  return (
    <figure className="my-2">
      <div className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={caption} className="h-auto w-full max-w-xl">
          {steps.map((_, i) =>
            i < steps.length - 1 ? (
              <line
                key={`arrow-${i}`}
                x1={centerX}
                y1={boxTop(i) + BOX_HEIGHT}
                x2={centerX}
                y2={boxTop(i + 1)}
                stroke="currentColor"
                strokeWidth={2}
                markerEnd="url(#flow-arrow)"
                className="text-zinc-300 dark:text-zinc-600"
              />
            ) : null
          )}

          {/* Loop-back arrow: steps 2 (apply interest) through 3 (add contribution) repeat every month. */}
          {steps.length >= 3 && (
            <path
              d={`M ${centerX + BOX_WIDTH / 2} ${boxCenterY(1)}
                  C ${centerX + BOX_WIDTH / 2 + 70} ${boxCenterY(1)},
                    ${centerX + BOX_WIDTH / 2 + 70} ${boxCenterY(2)},
                    ${centerX + BOX_WIDTH / 2} ${boxCenterY(2)}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="4 4"
              markerEnd="url(#flow-arrow-loop)"
              className="text-blue-400 dark:text-blue-500"
            />
          )}

          {steps.map((step, i) => (
            <g key={i}>
              <rect
                x={centerX - BOX_WIDTH / 2}
                y={boxTop(i)}
                width={BOX_WIDTH}
                height={BOX_HEIGHT}
                rx={10}
                className={i === steps.length - 1 ? "fill-emerald-50 stroke-emerald-300 dark:fill-emerald-500/10 dark:stroke-emerald-500/40" : "fill-white stroke-blue-200 dark:fill-zinc-900 dark:stroke-blue-500/30"}
                strokeWidth={1.5}
              />
              <text
                x={centerX}
                y={boxCenterY(i) + 5}
                textAnchor="middle"
                fontSize={13}
                className={i === steps.length - 1 ? "fill-emerald-700 font-semibold dark:fill-emerald-400" : "fill-zinc-700 dark:fill-zinc-200"}
              >
                {step}
              </text>
            </g>
          ))}

          <defs>
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-300 dark:fill-zinc-600" />
            </marker>
            <marker id="flow-arrow-loop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-blue-400 dark:fill-blue-500" />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
