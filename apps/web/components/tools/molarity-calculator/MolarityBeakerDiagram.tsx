type MolarityBeakerDiagramProps = {
  dotCount: number;
  molesLabel: string;
  volumeLabel: string;
  caption: string;
};

const MAX_DOTS = 24;

/**
 * A beaker of liquid with a dot count that scales with molarity (clamped
 * for legibility) — more dots means a more concentrated solution, a
 * direct visual analog of moles dissolved in a fixed volume.
 */
export default function MolarityBeakerDiagram({ dotCount, molesLabel, volumeLabel, caption }: MolarityBeakerDiagramProps) {
  const count = Math.max(1, Math.min(MAX_DOTS, Math.round(dotCount)));
  const dots = Array.from({ length: count }, (_, i) => {
    const col = i % 6;
    const row = Math.floor(i / 6);
    return { x: 40 + col * 22, y: 100 - row * 18 };
  });

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 200 130" role="img" aria-label={caption} className="h-auto w-full max-w-[220px] text-current">
          <path d="M55,20 L55,60 L30,115 Q30,122 38,122 L162,122 Q170,122 170,115 L145,60 L145,20" fill="none" stroke="currentColor" strokeWidth={2} opacity={0.5} />
          <path d="M32,90 L168,90 L145,60 L55,60 Z" className="fill-blue-500/15" />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={Math.max(65, d.y)} r={3} className="fill-blue-600 dark:fill-blue-400" />
          ))}
          <text x={100} y={16} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {molesLabel}
          </text>
          <text x={100} y={129} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {volumeLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
