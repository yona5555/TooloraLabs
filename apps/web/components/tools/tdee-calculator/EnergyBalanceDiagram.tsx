type EnergyBalanceDiagramProps = {
  caloriesInLabel: string;
  caloriesOutLabel: string;
  fulcrumLabel: string;
  caption: string;
};

const WIDTH = 460;
const HEIGHT = 240;
const BEAM_Y = 70;
const BEAM_HALF = 170;
const FULCRUM_Y = 130;

export default function EnergyBalanceDiagram({ caloriesInLabel, caloriesOutLabel, fulcrumLabel, caption }: EnergyBalanceDiagramProps) {
  const centerX = WIDTH / 2;
  const leftX = centerX - BEAM_HALF;
  const rightX = centerX + BEAM_HALF;
  const panY = BEAM_Y + 60;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 380 }}>
          {/* stand + fulcrum */}
          <line x1={centerX} y1={BEAM_Y} x2={centerX} y2={FULCRUM_Y} stroke="currentColor" strokeWidth={2} />
          <polygon points={`${centerX - 16},${FULCRUM_Y + 26} ${centerX + 16},${FULCRUM_Y + 26} ${centerX},${FULCRUM_Y}`} fill="none" stroke="currentColor" strokeWidth={2} />
          <line x1={centerX - 30} y1={FULCRUM_Y + 26} x2={centerX + 30} y2={FULCRUM_Y + 26} stroke="currentColor" strokeWidth={2} />
          <text x={centerX} y={FULCRUM_Y + 46} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.75}>
            {fulcrumLabel}
          </text>

          {/* beam */}
          <line x1={leftX} y1={BEAM_Y} x2={rightX} y2={BEAM_Y} stroke="currentColor" strokeWidth={2.5} />
          <circle cx={centerX} cy={BEAM_Y} r={4} fill="currentColor" />

          {/* left pan (calories in) */}
          <line x1={leftX} y1={BEAM_Y} x2={leftX - 24} y2={panY} stroke="currentColor" strokeWidth={1.25} />
          <line x1={leftX} y1={BEAM_Y} x2={leftX + 24} y2={panY} stroke="currentColor" strokeWidth={1.25} />
          <path d={`M ${leftX - 30} ${panY} q 30 22 60 0`} fill="none" stroke="currentColor" strokeWidth={2} />
          <text x={leftX} y={panY + 40} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
            {caloriesInLabel}
          </text>

          {/* right pan (calories out) */}
          <line x1={rightX} y1={BEAM_Y} x2={rightX - 24} y2={panY} stroke="currentColor" strokeWidth={1.25} />
          <line x1={rightX} y1={BEAM_Y} x2={rightX + 24} y2={panY} stroke="currentColor" strokeWidth={1.25} />
          <path d={`M ${rightX - 30} ${panY} q 30 22 60 0`} fill="none" stroke="currentColor" strokeWidth={2} />
          <text x={rightX} y={panY + 40} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
            {caloriesOutLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
