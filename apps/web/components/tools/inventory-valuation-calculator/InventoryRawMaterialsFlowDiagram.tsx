type InventoryRawMaterialsFlowDiagramProps = {
  rawLabel: string;
  logicLabel: string;
  finishedLabel: string;
  caption: string;
};

const WIDTH = 300;
const BOX_W = 84;
const BOX_H = 50;
const GAP = 28;

export default function InventoryRawMaterialsFlowDiagram({ rawLabel, logicLabel, finishedLabel, caption }: InventoryRawMaterialsFlowDiagramProps) {
  const boxes = [rawLabel, logicLabel, finishedLabel];

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${BOX_H + 20}`} role="img" aria-label={`${rawLabel} → ${finishedLabel}`} className="h-auto w-full" style={{ minWidth: 280 }}>
          {boxes.map((label, i) => {
            const x = i * (BOX_W + GAP);
            const isMiddle = i === 1;
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
                  y={10 + BOX_H / 2 + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill={isMiddle ? "white" : undefined}
                  className={isMiddle ? undefined : "fill-fuchsia-700 dark:fill-fuchsia-300"}
                >
                  {label}
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
