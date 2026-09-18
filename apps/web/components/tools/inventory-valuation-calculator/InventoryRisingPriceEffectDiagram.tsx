type InventoryRisingPriceEffectDiagramProps = {
  fifoLabel: string;
  lifoLabel: string;
  fifoTraits: string[];
  lifoTraits: string[];
  caption: string;
};

const WIDTH = 300;
const BOX_W = 134;
const BOX_GAP = 16;
const BOX_PAD = 10;
const ROW_H = 11;
const MAX_CHARS_PER_LINE = 22;

/** Greedy word-wrap for short SVG box text — SVG <text> never wraps on its own. */
function wrapText(text: string): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > MAX_CHARS_PER_LINE && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function traitLineCount(traits: string[]): number {
  return traits.reduce((sum, t) => sum + wrapText(t).length, 0);
}

export default function InventoryRisingPriceEffectDiagram({ fifoLabel, lifoLabel, fifoTraits, lifoTraits, caption }: InventoryRisingPriceEffectDiagramProps) {
  const maxLines = Math.max(traitLineCount(fifoTraits), traitLineCount(lifoTraits));
  const boxH = 34 + maxLines * ROW_H + (Math.max(fifoTraits.length, lifoTraits.length) - 1) * 4;

  function renderTraits(traits: string[], x: number) {
    let y = 32;
    return traits.map((tItem) => {
      const lines = wrapText(tItem);
      const startY = y;
      y += lines.length * ROW_H + 4;
      return (
        <text key={tItem} x={x} fontSize={8.5}>
          {lines.map((line, li) => (
            <tspan key={li} x={x} y={startY + li * ROW_H}>
              {li === 0 ? `• ${line}` : `  ${line}`}
            </tspan>
          ))}
        </text>
      );
    });
  }

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${boxH + 12}`} role="img" aria-label={`${fifoLabel} vs ${lifoLabel}`} className="h-auto w-full" style={{ minWidth: 280 }}>
          <rect x={0} y={0} width={BOX_W} height={boxH} rx={8} className="fill-rose-50 stroke-rose-400 dark:fill-rose-500/10 dark:stroke-rose-400/60" strokeWidth={1.5} />
          <text x={BOX_W / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-rose-700 dark:fill-rose-300">
            {fifoLabel}
          </text>
          <g className="fill-rose-700 dark:fill-rose-300">{renderTraits(fifoTraits, BOX_PAD)}</g>

          <rect x={BOX_W + BOX_GAP} y={0} width={BOX_W} height={boxH} rx={8} className="fill-rose-100 stroke-rose-600 dark:fill-rose-500/20 dark:stroke-rose-400" strokeWidth={1.5} />
          <text x={BOX_W + BOX_GAP + BOX_W / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-rose-800 dark:fill-rose-200">
            {lifoLabel}
          </text>
          <g className="fill-rose-800 dark:fill-rose-200">{renderTraits(lifoTraits, BOX_W + BOX_GAP + BOX_PAD)}</g>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
