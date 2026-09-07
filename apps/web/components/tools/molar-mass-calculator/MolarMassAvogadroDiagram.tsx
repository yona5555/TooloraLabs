type MolarMassAvogadroDiagramProps = {
  caption: string;
  moleLabel: string;
  particleLabel: string;
};

const DOT_COUNT = 30;

/**
 * A fixed illustration of what "one mole" actually counts: a fixed number
 * of particles (Avogadro's number, ~6.022x10^23), represented here by a
 * grid of dots standing in for that (vastly larger, unshowable) count.
 */
export default function MolarMassAvogadroDiagram({ caption, moleLabel, particleLabel }: MolarMassAvogadroDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-blue-500/70" />
          ))}
        </div>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {moleLabel} = 6.022 × 10²³ {particleLabel}
        </p>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
