type CostFlowDiagramProps = {
  fifoTitle: string;
  lifoTitle: string;
  oldestLabel: string;
  newestLabel: string;
  outLabel: string;
  caption: string;
};

const WIDTH = 480;
const HEIGHT = 230;
const LAYER_W = 100;
const LAYER_H = 34;
const GAP = 4;
const STACK_BASE_Y = 190;

function Stack({
  x,
  title,
  arrowAtTop,
  oldestLabel,
  newestLabel,
  outLabel,
}: {
  x: number;
  title: string;
  arrowAtTop: boolean;
  oldestLabel: string;
  newestLabel: string;
  outLabel: string;
}) {
  const layers = [
    { label: oldestLabel, opacity: 0.35 },
    { label: "", opacity: 0.55 },
    { label: newestLabel, opacity: 0.8 },
  ];

  return (
    <g>
      <text x={x + LAYER_W / 2} y={22} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
        {title}
      </text>
      {layers.map((layer, i) => {
        const y = STACK_BASE_Y - (i + 1) * (LAYER_H + GAP);
        return (
          <g key={i}>
            <rect x={x} y={y} width={LAYER_W} height={LAYER_H} rx={4} fill="currentColor" opacity={layer.opacity} />
            {layer.label && (
              <text x={x + LAYER_W / 2} y={y + LAYER_H / 2 + 4} textAnchor="middle" fontSize={10} fill="white">
                {layer.label}
              </text>
            )}
          </g>
        );
      })}
      {/* arrow pointing out of the layer consumed first */}
      {arrowAtTop ? (
        <g>
          <line x1={x + LAYER_W / 2} y1={STACK_BASE_Y - 3 * (LAYER_H + GAP) + LAYER_H / 2} x2={x + LAYER_W / 2} y2={12 + 14} stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arrowhead)" opacity={0.9} />
        </g>
      ) : (
        <g>
          <line x1={x + LAYER_W / 2} y1={STACK_BASE_Y - LAYER_H / 2} x2={x + LAYER_W / 2} y2={STACK_BASE_Y + 22} stroke="currentColor" strokeWidth={1.5} markerEnd="url(#arrowhead)" opacity={0.9} />
        </g>
      )}
      <text x={x + LAYER_W / 2} y={STACK_BASE_Y + 40} textAnchor="middle" fontSize={10} fontWeight={700} fill="currentColor">
        {outLabel}
      </text>
    </g>
  );
}

export default function CostFlowDiagram({
  fifoTitle,
  lifoTitle,
  oldestLabel,
  newestLabel,
  outLabel,
  caption,
}: CostFlowDiagramProps) {
  const fifoX = 60;
  const lifoX = WIDTH - 60 - LAYER_W;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 420 }}>
          <defs>
            <marker id="arrowhead" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" opacity={0.9} />
            </marker>
          </defs>
          <Stack x={fifoX} title={fifoTitle} arrowAtTop={false} oldestLabel={oldestLabel} newestLabel={newestLabel} outLabel={outLabel} />
          <Stack x={lifoX} title={lifoTitle} arrowAtTop={true} oldestLabel={oldestLabel} newestLabel={newestLabel} outLabel={outLabel} />
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
