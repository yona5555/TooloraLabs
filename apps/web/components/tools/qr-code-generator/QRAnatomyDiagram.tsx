type QRAnatomyDiagramProps = {
  finderLabel: string;
  timingLabel: string;
  quietZoneLabel: string;
  dataLabel: string;
  caption: string;
};

const GRID = 21; // Version-1 QR code module count (the smallest real QR grid).
const CELL = 10;
const MARGIN = 28; // quiet zone
const GRID_PX = GRID * CELL;
const WIDTH = GRID_PX + MARGIN * 2;
const HEIGHT = GRID_PX + MARGIN * 2;

// A deterministic, non-decoding pseudo-random fill so the "data" region looks
// like real QR noise without claiming to encode anything.
function pseudoRandomBit(x: number, y: number): boolean {
  const n = (x * 928371 + y * 123457 + x * y * 7) % 997;
  return n % 2 === 0;
}

function isFinderZone(x: number, y: number): boolean {
  const zones = [
    [0, 0],
    [GRID - 7, 0],
    [0, GRID - 7],
  ];
  return zones.some(([zx, zy]) => x >= zx && x < zx + 7 && y >= zy && y < zy + 7);
}

function finderCell(x: number, y: number, zx: number, zy: number): boolean {
  const lx = x - zx;
  const ly = y - zy;
  const onOuterRing = lx === 0 || lx === 6 || ly === 0 || ly === 6;
  const onInnerSquare = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return onOuterRing || onInnerSquare;
}

function isTimingZone(x: number, y: number): boolean {
  return (x === 6 && y >= 8 && y < GRID - 8) || (y === 6 && x >= 8 && x < GRID - 8);
}

type Cell = { x: number; y: number; fill: boolean; kind: "finder" | "timing" | "data" };

const CELLS: Cell[] = (() => {
  const cells: Cell[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (isFinderZone(x, y)) {
        const zx = x < 7 ? 0 : GRID - 7;
        const zy = y < 7 ? 0 : GRID - 7;
        cells.push({ x, y, fill: finderCell(x, y, zx, zy), kind: "finder" });
      } else if (isTimingZone(x, y)) {
        cells.push({ x, y, fill: (x + y) % 2 === 0, kind: "timing" });
      } else {
        cells.push({ x, y, fill: pseudoRandomBit(x, y), kind: "data" });
      }
    }
  }
  return cells;
})();

const KIND_OPACITY: Record<Cell["kind"], number> = {
  finder: 1,
  timing: 0.55,
  data: 0.85,
};

export default function QRAnatomyDiagram({ finderLabel, timingLabel, quietZoneLabel, dataLabel, caption }: QRAnatomyDiagramProps) {
  return (
    <figure className="my-2">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-center">
        <div dir="ltr" className="shrink-0">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-[280px] text-current">
            <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="4 3" opacity={0.35} />
            {CELLS.map((cell) => (
              <rect
                key={`${cell.x}-${cell.y}`}
                x={MARGIN + cell.x * CELL}
                y={MARGIN + cell.y * CELL}
                width={CELL}
                height={CELL}
                fill="currentColor"
                opacity={cell.fill ? KIND_OPACITY[cell.kind] : 0}
              />
            ))}
          </svg>
        </div>

        <ul className="w-full max-w-xs space-y-2.5 text-sm">
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-current opacity-100" />
            <span>{finderLabel}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-current opacity-55" />
            <span>{timingLabel}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-current opacity-85" />
            <span>{dataLabel}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm border border-current opacity-40" />
            <span>{quietZoneLabel}</span>
          </li>
        </ul>
      </div>
      <figcaption className="mt-3 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
