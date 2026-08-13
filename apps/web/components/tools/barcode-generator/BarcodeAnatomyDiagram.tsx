type BarcodeAnatomyDiagramProps = {
  quietZoneLabel: string;
  guardLabel: string;
  dataLabel: string;
  caption: string;
};

// A schematic, illustrative EAN/UPC-style pattern — widths chosen to look
// realistic, not decoded from real data.
const PATTERN: { width: number; filled: boolean; tall?: boolean; zone: "guard" | "data" }[] = [
  { width: 1, filled: true, tall: true, zone: "guard" },
  { width: 1, filled: false, tall: true, zone: "guard" },
  { width: 1, filled: true, tall: true, zone: "guard" },
  { width: 2, filled: false, zone: "data" },
  { width: 1, filled: true, zone: "data" },
  { width: 1, filled: false, zone: "data" },
  { width: 2, filled: true, zone: "data" },
  { width: 1, filled: false, zone: "data" },
  { width: 3, filled: true, zone: "data" },
  { width: 1, filled: false, zone: "data" },
  { width: 1, filled: true, zone: "data" },
  { width: 2, filled: false, zone: "data" },
  { width: 1, filled: true, tall: true, zone: "guard" },
  { width: 1, filled: false, tall: true, zone: "guard" },
  { width: 1, filled: true, tall: true, zone: "guard" },
  { width: 1, filled: false, tall: true, zone: "guard" },
  { width: 1, filled: true, tall: true, zone: "guard" },
];

const MODULE_W = 8;
const BAR_H = 70;
const TALL_EXTRA = 12;
const QUIET_MODULES = 4;
const WIDTH = (PATTERN.reduce((s, p) => s + p.width, 0) + QUIET_MODULES * 2) * MODULE_W + 180;
const HEIGHT = BAR_H + TALL_EXTRA + 30;

export default function BarcodeAnatomyDiagram({ quietZoneLabel, guardLabel, dataLabel, caption }: BarcodeAnatomyDiagramProps) {
  const positioned = PATTERN.reduce<{ x: number; seg: (typeof PATTERN)[number] }[]>((acc, seg) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].x + acc[acc.length - 1].seg.width * MODULE_W : QUIET_MODULES * MODULE_W;
    return [...acc, { x: prevEnd, seg }];
  }, []);

  return (
    <figure className="my-2">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-center">
        <div dir="ltr" className="shrink-0">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-[340px] text-current">
            <rect x={0} y={0} width={QUIET_MODULES * MODULE_W} height={BAR_H + TALL_EXTRA} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
            {positioned.map(({ x, seg }, i) => {
              if (!seg.filled) return null;
              return <rect key={i} x={x} y={0} width={seg.width * MODULE_W} height={BAR_H + (seg.tall ? TALL_EXTRA : 0)} fill="currentColor" />;
            })}
          </svg>
        </div>

        <ul className="w-full max-w-xs space-y-2.5 text-sm">
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm border border-dashed border-current opacity-50" />
            <span>{quietZoneLabel}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-current opacity-100" />
            <span>{guardLabel}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-current opacity-70" />
            <span>{dataLabel}</span>
          </li>
        </ul>
      </div>
      <figcaption className="mt-3 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
