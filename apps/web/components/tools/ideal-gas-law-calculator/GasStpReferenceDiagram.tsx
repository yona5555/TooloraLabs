type GasStpReferenceDiagramProps = {
  caption: string;
  label: string;
};

/**
 * A fixed illustrative box comparing the volume of 1 mole of ideal gas at
 * STP (22.4 L) to a 1-liter reference box, giving a concrete sense of
 * scale for that commonly-cited constant.
 */
export default function GasStpReferenceDiagram({ caption, label }: GasStpReferenceDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex items-end justify-center gap-4 overflow-x-auto">
        <div className="flex flex-col items-center gap-1">
          <div className="h-6 w-6 rounded border-2 border-zinc-400 dark:border-zinc-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">1 L</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-24 w-24 rounded border-2 border-blue-500 bg-blue-500/15" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{label}</span>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
