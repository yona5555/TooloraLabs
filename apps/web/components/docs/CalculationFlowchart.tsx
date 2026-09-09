type LoopBack = {
  /** Index of the step the loop returns to (the earlier step). */
  from: number;
  /** Index of the step the loop departs from (the later step, which points back to `from`). */
  to: number;
  /** Short label clarifying what repeats and how often, e.g. "Repeats monthly". */
  label: string;
};

type Props = {
  steps: string[];
  caption: string;
  /**
   * Optional: only pass this when two specific consecutive steps genuinely
   * repeat in a loop in the underlying engine (e.g. a month-by-month
   * amortization step pair). Omit it for any flowchart that's just a
   * sequence of steps — most tools have no loop at all.
   */
  loop?: LoopBack;
};

const BASE_WIDTH = 640;
/** Extra horizontal room reserved for the loop-back curve's bulge and its label, when present. */
const LOOP_MARGIN = 170;
const BOX_WIDTH = 580;
const PADDING_H = 22;
const PADDING_V = 16;
const FONT_SIZE = 14;
const LINE_HEIGHT = 20;
const GAP = 44;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 16;
/** Rough average glyph width as a fraction of font size, close enough for both Latin and Arabic text at this size. */
const AVG_CHAR_WIDTH = FONT_SIZE * 0.56;

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

/**
 * A vertical flowchart of an engine's calculation steps, one box per step,
 * with box height sized to its own (word-wrapped) text so no two steps are
 * ever forced into the same fixed height. A loop-back arrow is opt-in via
 * the `loop` prop and must never be assumed present — most flowcharts here
 * describe a plain sequence, not a repeating loop.
 */
export default function CalculationFlowchart({ steps, caption, loop }: Props) {
  const width = loop ? BASE_WIDTH + LOOP_MARGIN : BASE_WIDTH;
  const centerX = BASE_WIDTH / 2;
  const maxCharsPerLine = Math.max(10, Math.floor((BOX_WIDTH - PADDING_H * 2) / AVG_CHAR_WIDTH));

  const wrapped = steps.map((step) => wrapText(step, maxCharsPerLine));
  const boxHeights = wrapped.map((lines) => PADDING_V * 2 + lines.length * LINE_HEIGHT);

  const boxTops: number[] = [];
  let cursor = PADDING_TOP;
  for (const h of boxHeights) {
    boxTops.push(cursor);
    cursor += h + GAP;
  }
  const height = cursor - GAP + PADDING_BOTTOM;

  const boxTop = (i: number) => boxTops[i];
  const boxCenterY = (i: number) => boxTops[i] + boxHeights[i] / 2;
  const rightEdgeX = centerX + BOX_WIDTH / 2;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={caption} className="h-auto w-full max-w-xl">
          {steps.map((_, i) =>
            i < steps.length - 1 ? (
              <line
                key={`arrow-${i}`}
                x1={centerX}
                y1={boxTop(i) + boxHeights[i]}
                x2={centerX}
                y2={boxTop(i + 1)}
                stroke="currentColor"
                strokeWidth={2}
                markerEnd="url(#flow-arrow)"
                className="text-zinc-300 dark:text-zinc-600"
              />
            ) : null
          )}

          {loop && (
            <>
              <path
                d={`M ${rightEdgeX} ${boxCenterY(loop.from)}
                    C ${rightEdgeX + 70} ${boxCenterY(loop.from)},
                      ${rightEdgeX + 70} ${boxCenterY(loop.to)},
                      ${rightEdgeX} ${boxCenterY(loop.to)}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="4 4"
                markerEnd="url(#flow-arrow-loop)"
                className="text-blue-400 dark:text-blue-500"
              />
              <text
                x={rightEdgeX + 76}
                y={(boxCenterY(loop.from) + boxCenterY(loop.to)) / 2}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={600}
                className="fill-blue-500 dark:fill-blue-400"
              >
                {loop.label}
              </text>
            </>
          )}

          {steps.map((_, i) => (
            <g key={i}>
              <rect
                x={centerX - BOX_WIDTH / 2}
                y={boxTop(i)}
                width={BOX_WIDTH}
                height={boxHeights[i]}
                rx={10}
                className={i === steps.length - 1 ? "fill-emerald-50 stroke-emerald-300 dark:fill-emerald-500/10 dark:stroke-emerald-500/40" : "fill-white stroke-blue-200 dark:fill-zinc-900 dark:stroke-blue-500/30"}
                strokeWidth={1.5}
              />
              <text
                x={centerX}
                textAnchor="middle"
                fontSize={FONT_SIZE}
                className={i === steps.length - 1 ? "fill-emerald-700 font-semibold dark:fill-emerald-400" : "fill-zinc-700 dark:fill-zinc-200"}
              >
                {wrapped[i].map((line, li) => (
                  <tspan key={li} x={centerX} y={boxTop(i) + PADDING_V + LINE_HEIGHT * (li + 0.72)}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          ))}

          <defs>
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-300 dark:fill-zinc-600" />
            </marker>
            <marker id="flow-arrow-loop" viewBox="0 0 10 10" refX="10" refY="5" markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-blue-400 dark:fill-blue-500" />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
