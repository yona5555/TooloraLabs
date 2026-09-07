type MultiplicationGridDiagramProps = {
  headers: number[];
  caption: string;
};

const CELL = 40;
const LABEL_COL = 40;

export default function MultiplicationGridDiagram({ headers, caption }: MultiplicationGridDiagramProps) {
  const n = headers.length;
  const width = LABEL_COL + n * CELL;
  const height = LABEL_COL + n * CELL;

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={caption} className="h-auto text-current" style={{ width: width * 1.6, maxWidth: 320 }}>
          <rect x={0} y={0} width={LABEL_COL} height={LABEL_COL} className="fill-zinc-100 dark:fill-zinc-800" />
          {headers.map((h, i) => (
            <rect key={`ch-${h}`} x={LABEL_COL + i * CELL} y={0} width={CELL} height={LABEL_COL} className="fill-blue-100 dark:fill-blue-500/20" stroke="currentColor" strokeWidth={0.5} opacity={0.6} />
          ))}
          {headers.map((h, i) => (
            <rect key={`rh-${h}`} x={0} y={LABEL_COL + i * CELL} width={LABEL_COL} height={CELL} className="fill-blue-100 dark:fill-blue-500/20" stroke="currentColor" strokeWidth={0.5} opacity={0.6} />
          ))}
          {headers.map((h, i) => (
            <text key={`cht-${h}`} x={LABEL_COL + i * CELL + CELL / 2} y={LABEL_COL / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
              {h}
            </text>
          ))}
          {headers.map((h, i) => (
            <text key={`rht-${h}`} x={LABEL_COL / 2} y={LABEL_COL + i * CELL + CELL / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
              {h}
            </text>
          ))}
          {headers.map((rowH, r) =>
            headers.map((colH, c) => (
              <g key={`cell-${r}-${c}`}>
                <rect
                  x={LABEL_COL + c * CELL}
                  y={LABEL_COL + r * CELL}
                  width={CELL}
                  height={CELL}
                  className={r === c ? "fill-emerald-100 dark:fill-emerald-500/20" : "fill-white dark:fill-zinc-900"}
                  stroke="currentColor"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
                <text x={LABEL_COL + c * CELL + CELL / 2} y={LABEL_COL + r * CELL + CELL / 2 + 4} textAnchor="middle" fontSize={11} fill="currentColor">
                  {rowH * colH}
                </text>
              </g>
            ))
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
