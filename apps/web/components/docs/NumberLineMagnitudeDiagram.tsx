type NumberLineMagnitudeDiagramProps = {
  markers: { label: string; exponent: number }[];
  highlightExponent: number;
  caption: string;
};

const WIDTH = 320;
const HEIGHT = 70;
const MARGIN = 24;

export default function NumberLineMagnitudeDiagram({ markers, highlightExponent, caption }: NumberLineMagnitudeDiagramProps) {
  const minExp = Math.min(...markers.map((m) => m.exponent));
  const maxExp = Math.max(...markers.map((m) => m.exponent));
  const span = Math.max(maxExp - minExp, 1);
  const xAt = (exponent: number) => MARGIN + ((exponent - minExp) / span) * (WIDTH - MARGIN * 2);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-72 text-current" style={{ minWidth: 260 }}>
          <line x1={MARGIN} y1={HEIGHT / 2} x2={WIDTH - MARGIN} y2={HEIGHT / 2} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {markers.map((marker) => {
            const x = xAt(marker.exponent);
            return (
              <g key={marker.label}>
                <line x1={x} y1={HEIGHT / 2 - 6} x2={x} y2={HEIGHT / 2 + 6} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
                <text x={x} y={HEIGHT / 2 + 22} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7}>
                  {marker.label}
                </text>
              </g>
            );
          })}
          <circle cx={xAt(highlightExponent)} cy={HEIGHT / 2} r={6} className="fill-blue-600 dark:fill-blue-400" />
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
