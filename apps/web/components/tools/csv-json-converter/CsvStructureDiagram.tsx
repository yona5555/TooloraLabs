type CsvStructureDiagramProps = {
  caption: string;
};

const HEADERS = ["name", "age", "city"];
const ROWS = [
  ["Alice", "30", "Cairo"],
  ["Bob", "25", "Giza"],
];

const CELL_W = 62;
const CELL_H = 26;
const TABLE_X = 10;
const TABLE_Y = 10;
const TABLE_W = CELL_W * 3;
const TABLE_H = CELL_H * 3;

const JSON_LINES = [
  "[",
  '  { "name": "Alice",',
  '    "age": "30",',
  '    "city": "Cairo" },',
  '  { "name": "Bob",',
  '    "age": "25",',
  '    "city": "Giza" }',
  "]",
];

const WIDTH = 480;
const HEIGHT = 190;
const JSON_X = 260;

export default function CsvStructureDiagram({ caption }: CsvStructureDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 420 }}>
          {/* CSV grid */}
          {[HEADERS, ...ROWS].map((row, r) => (
            <g key={r}>
              {row.map((cell, c) => (
                <g key={c}>
                  <rect
                    x={TABLE_X + c * CELL_W}
                    y={TABLE_Y + r * CELL_H}
                    width={CELL_W}
                    height={CELL_H}
                    fill={r === 0 ? "currentColor" : "none"}
                    opacity={r === 0 ? 0.15 : 1}
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={TABLE_X + c * CELL_W + CELL_W / 2}
                    y={TABLE_Y + r * CELL_H + CELL_H / 2 + 4}
                    textAnchor="middle"
                    fontSize={10.5}
                    fontWeight={r === 0 ? 700 : 400}
                    fill="currentColor"
                  >
                    {cell}
                  </text>
                </g>
              ))}
            </g>
          ))}
          <text x={TABLE_X} y={TABLE_Y + TABLE_H + 20} fontSize={11} fontWeight={700} fill="currentColor">
            CSV: rows → array, header → keys
          </text>

          {/* arrow */}
          <path d={`M ${TABLE_X + TABLE_W + 12} ${TABLE_Y + TABLE_H / 2} L ${JSON_X - 12} ${TABLE_Y + TABLE_H / 2}`} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
          <path d={`M ${JSON_X - 18} ${TABLE_Y + TABLE_H / 2 - 5} L ${JSON_X - 12} ${TABLE_Y + TABLE_H / 2} L ${JSON_X - 18} ${TABLE_Y + TABLE_H / 2 + 5}`} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5} />

          {/* JSON text */}
          <g fontFamily="monospace" fontSize={10.5} fill="currentColor">
            {JSON_LINES.map((line, i) => (
              <text key={i} x={JSON_X} y={TABLE_Y + 6 + i * 14}>
                {line}
              </text>
            ))}
          </g>
          <text x={JSON_X} y={TABLE_Y + TABLE_H + 20} fontSize={11} fontWeight={700} fill="currentColor">
            JSON: array of objects
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
