type EnergyPotentialDiagramProps = {
  heightFraction: number;
  massLabel: string;
  heightLabel: string;
  caption: string;
};

const GROUND_Y = 90;
const TOP_Y = 12;

/**
 * An object resting at a height above a ground reference line, with its
 * vertical position on the diagram scaled (0-1, clamped) to reflect how
 * high the entered height is relative to a fixed illustrative ceiling —
 * not a literal to-scale drawing.
 */
export default function EnergyPotentialDiagram({ heightFraction, massLabel, heightLabel, caption }: EnergyPotentialDiagramProps) {
  const t = Math.min(1, Math.max(0, heightFraction));
  const objectY = GROUND_Y - t * (GROUND_Y - TOP_Y - 20);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 200 100" role="img" aria-label={caption} className="h-auto w-full max-w-[220px] text-current">
          <line x1={10} y1={GROUND_Y} x2={190} y2={GROUND_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />

          <line x1={40} y1={GROUND_Y} x2={40} y2={objectY} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
          <text x={46} y={(GROUND_Y + objectY) / 2} fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {heightLabel}
          </text>

          <rect x={100} y={objectY - 14} width={28} height={20} rx={4} className="fill-blue-500/25 stroke-blue-600 dark:fill-blue-400/20 dark:stroke-blue-400" strokeWidth={1.5} />
          <text x={114} y={objectY} textAnchor="middle" fontSize={8} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {massLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
