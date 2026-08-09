type TimelineEra = { year: string; title: string; note: string };

type ForexExchangeSystemDiagramProps = {
  eras: TimelineEra[];
  caption: string;
};

const NODE_GAP = 210;
const LEFT_MARGIN = 30;
const LINE_Y = 60;
const NODE_RADIUS = 7;

export default function ForexExchangeSystemDiagram({ eras, caption }: ForexExchangeSystemDiagramProps) {
  const width = LEFT_MARGIN * 2 + (eras.length - 1) * NODE_GAP;
  const height = 190;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={caption}
          className="h-auto w-full text-current"
          style={{ minWidth: 560 }}
        >
          <line x1={LEFT_MARGIN} y1={LINE_Y} x2={width - LEFT_MARGIN} y2={LINE_Y} stroke="currentColor" strokeWidth={1.5} />

          {eras.map((era, i) => {
            const x = LEFT_MARGIN + i * NODE_GAP;
            /**
             * The first and last nodes sit right at the viewBox edge, so
             * center-anchoring their (often the longest) labels the same way
             * as interior nodes clips half the text past the SVG boundary —
             * anchoring outward from the edge instead guarantees no clipping
             * regardless of label length, without having to guess a margin
             * wide enough for every possible translation.
             */
            const textAnchor = i === 0 ? "start" : i === eras.length - 1 ? "end" : "middle";
            return (
              <g key={era.year}>
                <circle cx={x} cy={LINE_Y} r={NODE_RADIUS} fill="none" stroke="currentColor" strokeWidth={1.5} />
                <circle cx={x} cy={LINE_Y} r={2} fill="currentColor" />

                <text x={x} y={LINE_Y - 20} textAnchor={textAnchor} fontSize={13} fontWeight={700} fontFamily="monospace" fill="currentColor">
                  {era.year}
                </text>

                <text x={x} y={LINE_Y + 34} textAnchor={textAnchor} fontSize={11.5} fontWeight={600} fill="currentColor">
                  {era.title}
                </text>
                <text x={x} y={LINE_Y + 52} textAnchor={textAnchor} fontSize={10} fill="currentColor" opacity={0.75}>
                  {era.note}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
