type PhSeesawDiagramProps = {
  pH: number;
  pOH: number;
  caption: string;
};

const CENTER_X = 120;
const BEAM_Y = 60;
const MAX_TILT = 12;

/**
 * A see-saw whose tilt visualizes pH + pOH = 14: the side with the smaller
 * value sits higher, and the beam is level only exactly at pH 7 / pOH 7.
 */
export default function PhSeesawDiagram({ pH, pOH, caption }: PhSeesawDiagramProps) {
  const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, (pH - 7) * (MAX_TILT / 7)));

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 240 100" role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <polygon points={`${CENTER_X - 10},90 ${CENTER_X + 10},90 ${CENTER_X},70`} className="fill-zinc-400 dark:fill-zinc-500" />

          <g transform={`rotate(${tilt} ${CENTER_X} ${BEAM_Y})`}>
            <line x1={CENTER_X - 90} y1={BEAM_Y} x2={CENTER_X + 90} y2={BEAM_Y} stroke="currentColor" strokeWidth={3} className="text-zinc-600 dark:text-zinc-300" />
            <circle cx={CENTER_X - 90} cy={BEAM_Y} r={5} className="fill-red-500" />
            <circle cx={CENTER_X + 90} cy={BEAM_Y} r={5} className="fill-blue-500" />
          </g>

          <text x={CENTER_X - 90} y={BEAM_Y - 12} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-red-600 dark:fill-red-400">
            pH {pH.toFixed(1)}
          </text>
          <text x={CENTER_X + 90} y={BEAM_Y - 12} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-blue-600 dark:fill-blue-400">
            pOH {pOH.toFixed(1)}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
