type InventoryRawMaterialsFlowDiagramProps = {
  rawLabel: string;
  logicLabel: string;
  finishedLabel: string;
  caption: string;
};

const WIDTH = 340;
const BOX_W = 96;
const BOX_H = 60;
const GAP = 16;
const LINE_HEIGHT = 10;
const MAX_CHARS_PER_LINE = 14;

/** Greedy word-wrap for short SVG box labels — SVG <text> never wraps on its own, so long labels must be pre-split into lines. */
function wrapLabel(label: string): string[] {
  const words = label.split(" ");
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

export default function InventoryRawMaterialsFlowDiagram({ rawLabel, logicLabel, finishedLabel, caption }: InventoryRawMaterialsFlowDiagramProps) {
  const boxes = [rawLabel, logicLabel, finishedLabel];

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${BOX_H + 20}`} role="img" aria-label={`${rawLabel} → ${finishedLabel}`} className="h-auto w-full" style={{ minWidth: 320 }}>
          {boxes.map((label, i) => {
            const x = i * (BOX_W + GAP);
            const isMiddle = i === 1;
            const lines = wrapLabel(label);
            const startY = 10 + BOX_H / 2 - ((lines.length - 1) * LINE_HEIGHT) / 2 + 3;
            return (
              <g key={label}>
                <rect
                  x={x}
                  y={10}
                  width={BOX_W}
                  height={BOX_H}
                  rx={8}
                  className={isMiddle ? "fill-fuchsia-500 dark:fill-fuchsia-400" : "fill-fuchsia-50 stroke-fuchsia-400 dark:fill-fuchsia-500/10 dark:stroke-fuchsia-400/60"}
                  strokeWidth={isMiddle ? 0 : 1.5}
                />
                <text
                  x={x + BOX_W / 2}
                  textAnchor="middle"
                  fontSize={8.5}
                  fontWeight={700}
                  fill={isMiddle ? "white" : undefined}
                  className={isMiddle ? undefined : "fill-fuchsia-700 dark:fill-fuchsia-300"}
                >
                  {lines.map((line, li) => (
                    <tspan key={li} x={x + BOX_W / 2} y={startY + li * LINE_HEIGHT}>
                      {line}
                    </tspan>
                  ))}
                </text>
                {i < boxes.length - 1 && (
                  <text x={x + BOX_W + GAP / 2} y={10 + BOX_H / 2 + 4} textAnchor="middle" fontSize={14} className="fill-zinc-400 dark:fill-zinc-500">
                    →
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
