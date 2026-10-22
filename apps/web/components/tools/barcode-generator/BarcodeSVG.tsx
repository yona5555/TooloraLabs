import type { ReactNode } from "react";

export type BarcodeSegment = { width: number; filled: boolean; tall?: boolean };

type BarcodeSVGProps = {
  segments: BarcodeSegment[];
  displayText: string;
  quietZoneModules: number;
  logoDataUrl: string | null;
  logoPlacement: "beside" | "none";
  moduleWidth?: number;
  /** Drawn on top of the bars in the same coordinate system; tagged `data-overlay` so downloads strip it. */
  overlay?: ReactNode;
};

export const BAR_HEIGHT = 80;
export const TALL_EXTRA = 10;
const TEXT_HEIGHT = 22;
export const MODULE_W = 2;

/** The SVG's own layout, so an overlay (or a pointer) can map a module index to a position. */
export function barcodeGeometry(segments: BarcodeSegment[], quietZoneModules: number, showLogo: boolean, moduleWidth = MODULE_W) {
  const totalModules = segments.reduce((sum, s) => sum + s.width, 0) + quietZoneModules * 2;
  const barsWidth = totalModules * moduleWidth;
  const height = BAR_HEIGHT + TALL_EXTRA + TEXT_HEIGHT + 10;
  const logoWidth = showLogo ? 90 : 0;
  const totalWidth = barsWidth + (showLogo ? logoWidth + 16 : 0);
  const moduleX = (m: number) => (quietZoneModules + m) * moduleWidth;
  return { totalModules, barsWidth, height, logoWidth, totalWidth, moduleX, moduleWidth };
}

export default function BarcodeSVG({ segments, displayText, quietZoneModules, logoDataUrl, logoPlacement, moduleWidth = MODULE_W, overlay }: BarcodeSVGProps) {
  const showLogo = logoPlacement === "beside" && !!logoDataUrl;
  const { barsWidth, height, logoWidth, totalWidth } = barcodeGeometry(segments, quietZoneModules, showLogo, moduleWidth);

  const positioned = segments.reduce<{ x: number; seg: BarcodeSegment }[]>((acc, seg) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].x + acc[acc.length - 1].seg.width * moduleWidth : quietZoneModules * moduleWidth;
    return [...acc, { x: prevEnd, seg }];
  }, []);

  return (
    <svg viewBox={`0 0 ${totalWidth} ${height}`} role="img" aria-label={displayText} className="block h-auto w-full max-w-full" style={{ direction: "ltr" }}>
      <rect x={0} y={0} width={totalWidth} height={height} fill="white" />
      <g>
        {positioned.map(({ x, seg }, i) => {
          if (!seg.filled) return null;
          const barH = BAR_HEIGHT + (seg.tall ? TALL_EXTRA : 0);
          return <rect key={i} x={x} y={0} width={seg.width * moduleWidth} height={barH} fill="black" />;
        })}
      </g>
      <text
        x={barsWidth / 2}
        y={BAR_HEIGHT + TALL_EXTRA + TEXT_HEIGHT - 4}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={16}
        letterSpacing={2}
        fill="black"
        direction="ltr"
        style={{ unicodeBidi: "bidi-override" }}
      >
        {displayText}
      </text>

      {showLogo && (
        <>
          <line x1={barsWidth + 8} y1={0} x2={barsWidth + 8} y2={BAR_HEIGHT + TALL_EXTRA} stroke="#d4d4d8" strokeWidth={1} />
          <image href={logoDataUrl ?? undefined} x={barsWidth + 16} y={(BAR_HEIGHT + TALL_EXTRA - logoWidth) / 2} width={logoWidth} height={logoWidth} preserveAspectRatio="xMidYMid meet" />
        </>
      )}

      {overlay && <g data-overlay="">{overlay}</g>}
    </svg>
  );
}
