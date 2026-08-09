type WaterCycleDiagramProps = {
  evaporationLabel: string;
  condensationLabel: string;
  precipitationLabel: string;
  collectionLabel: string;
  caption: string;
};

const WIDTH = 520;
const HEIGHT = 260;
const GROUND_Y = 210;

export default function WaterCycleDiagram({
  evaporationLabel,
  condensationLabel,
  precipitationLabel,
  collectionLabel,
  caption,
}: WaterCycleDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={caption}
          className="h-auto w-full text-current"
          style={{ minWidth: 420 }}
        >
          {/* sun */}
          <circle cx={460} cy={44} r={20} fill="none" stroke="currentColor" strokeWidth={1.5} />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            const x1 = 460 + Math.cos(angle) * 26;
            const y1 = 44 + Math.sin(angle) * 26;
            const x2 = 460 + Math.cos(angle) * 34;
            const y2 = 44 + Math.sin(angle) * 34;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={1.5} />;
          })}

          {/* ground / ocean line */}
          <line x1={30} y1={GROUND_Y} x2={490} y2={GROUND_Y} stroke="currentColor" strokeWidth={1.5} />
          <path
            d={`M 30 ${GROUND_Y} q 10 8 20 0 t 20 0 t 20 0 t 20 0`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            opacity={0.6}
          />

          {/* cloud */}
          <g>
            <circle cx={230} cy={78} r={22} fill="none" stroke="currentColor" strokeWidth={1.5} />
            <circle cx={255} cy={70} r={16} fill="none" stroke="currentColor" strokeWidth={1.5} />
            <circle cx={205} cy={70} r={16} fill="none" stroke="currentColor" strokeWidth={1.5} />
            <text x={230} y={45} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
              {condensationLabel}
            </text>
          </g>

          {/* evaporation: wavy arrow up from ground to cloud, left side */}
          <path
            d="M 90 205 C 80 170, 105 150, 95 120 C 88 95, 110 80, 130 75"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            markerEnd="url(#arrow)"
          />
          <text x={70} y={140} fontSize={12} fontWeight={700} fill="currentColor">
            {evaporationLabel}
          </text>

          {/* precipitation: rain lines from cloud down to ground, right side */}
          {[240, 260, 280].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1={100}
              x2={x - 10}
              y2={195}
              stroke="currentColor"
              strokeWidth={1.5}
              markerEnd={i === 1 ? "url(#arrow)" : undefined}
            />
          ))}
          <text x={300} y={150} fontSize={12} fontWeight={700} fill="currentColor">
            {precipitationLabel}
          </text>

          {/* collection: curved arrow along the ground back to the evaporation point */}
          <path
            d="M 260 226 C 200 250, 140 250, 95 226"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            markerEnd="url(#arrow)"
          />
          <text x={175} y={252} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
            {collectionLabel}
          </text>

          <defs>
            <marker id="arrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
