type PhConcentrationBarDiagramProps = {
  hConcentration: number;
  ohConcentration: number;
  hLabel: string;
  ohLabel: string;
  caption: string;
};

const MIN_LOG = -14;
const MAX_LOG = 0;
const BAR_MAX_WIDTH = 220;
const MIN_WIDTH = 6;

/**
 * Two bars comparing [H+] and [OH-] on a log scale — since the two always
 * multiply to 10^-14 at 25C, a longer H+ bar always pairs with a shorter
 * OH- bar and vice versa, making the inverse relationship visible at a
 * glance rather than just stated in the numbers.
 */
export default function PhConcentrationBarDiagram({ hConcentration, ohConcentration, hLabel, ohLabel, caption }: PhConcentrationBarDiagramProps) {
  const widthFor = (value: number) => {
    const safe = value > 0 ? value : 10 ** MIN_LOG;
    const log = Math.log10(safe);
    const t = (log - MIN_LOG) / (MAX_LOG - MIN_LOG);
    return MIN_WIDTH + Math.max(0, Math.min(1, t)) * (BAR_MAX_WIDTH - MIN_WIDTH);
  };

  const hWidth = widthFor(hConcentration);
  const ohWidth = widthFor(ohConcentration);

  return (
    <figure className="my-2">
      <div dir="ltr" className="mx-auto flex max-w-xs flex-col gap-3">
        <div>
          <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{hLabel}</span>
          </div>
          <div className="h-4 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-4 rounded-full bg-red-500/70" style={{ width: `${hWidth}px` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{ohLabel}</span>
          </div>
          <div className="h-4 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-4 rounded-full bg-blue-500/70" style={{ width: `${ohWidth}px` }} />
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
