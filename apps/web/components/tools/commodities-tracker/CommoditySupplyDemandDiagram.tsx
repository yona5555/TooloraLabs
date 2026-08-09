type CommoditySupplyDemandDiagramProps = {
  axisPriceLabel: string;
  axisQuantityLabel: string;
  supplyLabel: string;
  demandLabel: string;
  equilibriumLabel: string;
  caption: string;
};

const WIDTH = 480;
const HEIGHT = 320;
const MARGIN = 50;
const PLOT_WIDTH = WIDTH - MARGIN * 2;
const PLOT_HEIGHT = HEIGHT - MARGIN * 2;
const ORIGIN_X = MARGIN;
const ORIGIN_Y = HEIGHT - MARGIN;

/** Equilibrium sits where the (upward-sloping) supply line crosses the (downward-sloping) demand line, at roughly the plot's center. */
const EQUILIBRIUM_X = ORIGIN_X + PLOT_WIDTH * 0.52;
const EQUILIBRIUM_Y = ORIGIN_Y - PLOT_HEIGHT * 0.48;

export default function CommoditySupplyDemandDiagram({
  axisPriceLabel,
  axisQuantityLabel,
  supplyLabel,
  demandLabel,
  equilibriumLabel,
  caption,
}: CommoditySupplyDemandDiagramProps) {
  const supplyStart = { x: ORIGIN_X + PLOT_WIDTH * 0.08, y: ORIGIN_Y - PLOT_HEIGHT * 0.08 };
  const supplyEnd = { x: ORIGIN_X + PLOT_WIDTH * 0.92, y: ORIGIN_Y - PLOT_HEIGHT * 0.92 };
  const demandStart = { x: ORIGIN_X + PLOT_WIDTH * 0.08, y: ORIGIN_Y - PLOT_HEIGHT * 0.9 };
  const demandEnd = { x: ORIGIN_X + PLOT_WIDTH * 0.92, y: ORIGIN_Y - PLOT_HEIGHT * 0.1 };

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={caption}
          className="h-auto w-full text-current"
          style={{ minWidth: 380 }}
        >
          {/* axes */}
          <line x1={ORIGIN_X} y1={MARGIN - 10} x2={ORIGIN_X} y2={ORIGIN_Y} stroke="currentColor" strokeWidth={1.5} />
          <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={WIDTH - MARGIN + 10} y2={ORIGIN_Y} stroke="currentColor" strokeWidth={1.5} />
          <polygon points={`${ORIGIN_X - 4},${MARGIN - 4} ${ORIGIN_X + 4},${MARGIN - 4} ${ORIGIN_X},${MARGIN - 12}`} fill="currentColor" />
          <polygon
            points={`${WIDTH - MARGIN + 4},${ORIGIN_Y - 4} ${WIDTH - MARGIN + 4},${ORIGIN_Y + 4} ${WIDTH - MARGIN + 12},${ORIGIN_Y}`}
            fill="currentColor"
          />
          <text x={ORIGIN_X - 14} y={MARGIN - 16} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
            {axisPriceLabel}
          </text>
          <text x={WIDTH - MARGIN} y={ORIGIN_Y + 26} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
            {axisQuantityLabel}
          </text>

          {/* supply curve (upward sloping) */}
          <line x1={supplyStart.x} y1={supplyStart.y} x2={supplyEnd.x} y2={supplyEnd.y} stroke="currentColor" strokeWidth={1.75} />
          <text x={supplyEnd.x + 6} y={supplyEnd.y} fontSize={12} fontWeight={600} fill="currentColor">
            {supplyLabel}
          </text>

          {/* demand curve (downward sloping) */}
          <line x1={demandStart.x} y1={demandStart.y} x2={demandEnd.x} y2={demandEnd.y} stroke="currentColor" strokeWidth={1.75} strokeDasharray="6 4" />
          <text x={demandEnd.x + 6} y={demandEnd.y + 4} fontSize={12} fontWeight={600} fill="currentColor">
            {demandLabel}
          </text>

          {/* equilibrium point + dashed guides */}
          <line x1={EQUILIBRIUM_X} y1={EQUILIBRIUM_Y} x2={EQUILIBRIUM_X} y2={ORIGIN_Y} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
          <line x1={ORIGIN_X} y1={EQUILIBRIUM_Y} x2={EQUILIBRIUM_X} y2={EQUILIBRIUM_Y} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
          <circle cx={EQUILIBRIUM_X} cy={EQUILIBRIUM_Y} r={4} fill="currentColor" />
          <text x={EQUILIBRIUM_X + 10} y={EQUILIBRIUM_Y - 10} fontSize={12} fontWeight={700} fill="currentColor">
            {equilibriumLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
