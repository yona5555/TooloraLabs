type MolarityDilutionRatioDiagramProps = {
  caption: string;
};

const STEPS = [1, 0.5, 0.25, 0.125];

/**
 * A fixed illustrative row of beakers with progressively fading color,
 * showing how each further dilution step halves the concentration —
 * conceptual geometry, not tied to any one result's numbers.
 */
export default function MolarityDilutionRatioDiagram({ caption }: MolarityDilutionRatioDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center gap-4 overflow-x-auto">
        {STEPS.map((opacity, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 60 70" className="h-16 w-14 text-current">
              <path d="M18,8 L18,30 L8,58 Q8,62 12,62 L48,62 Q52,62 52,58 L42,30 L42,8" fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
              <path d="M10,45 L50,45 L42,30 L18,30 Z" className="fill-blue-500" style={{ opacity }} />
            </svg>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">×{opacity}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
