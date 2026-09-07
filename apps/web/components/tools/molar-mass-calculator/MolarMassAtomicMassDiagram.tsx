type MolarMassAtomicMassDiagramProps = {
  caption: string;
  isotopeLabels: string[];
};

/**
 * A fixed illustration of why atomic mass is a decimal, not a whole
 * number: it is a weighted average across an element's naturally
 * occurring isotopes, each with a different mass and abundance — shown
 * here as differently-sized, differently-frequent circles blending into
 * one average value.
 */
export default function MolarMassAtomicMassDiagram({ caption, isotopeLabels }: MolarMassAtomicMassDiagramProps) {
  const sizes = [26, 18, 12];
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex items-center justify-center gap-4">
        <div className="flex items-end gap-2">
          {sizes.map((size, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="rounded-full bg-blue-500/70" style={{ width: size, height: size }} />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{isotopeLabels[i]}</span>
            </div>
          ))}
        </div>
        <span className="text-lg text-zinc-400 dark:text-zinc-500">→</span>
        <div className="flex h-10 w-16 items-center justify-center rounded-lg border-2 border-blue-600 bg-blue-500/15 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
          35.45
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
