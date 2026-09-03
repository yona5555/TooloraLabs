import type { ReactNode } from "react";

export type Solid3DShape = "cube" | "rectangular-prism" | "sphere" | "cylinder" | "cone" | "square-pyramid";

type Props = {
  shape: Solid3DShape;
  side?: number;
  length?: number;
  width?: number;
  height?: number;
  radius?: number;
  baseSide?: number;
};

const BOX = 130;
const PAD = 40;
const SKEW_X = 32;
const SKEW_Y = 18;

function scaleDims(dims: number[], box = BOX): number[] {
  const max = Math.max(...dims, 1e-9);
  const factor = box / max;
  return dims.map((v) => Math.max(v * factor, 6));
}

/**
 * Shared live, proportionally-scaled pseudo-3D sketch of a solid, redrawn from the user's
 * own entered dimensions. Reused by both the Surface Area and Volume calculators, which
 * operate on the same six solids and the same dimension fields — only the formula each
 * derives from those dimensions differs.
 */
export default function Solid3DLiveShape(props: Props) {
  const { shape } = props;
  const cx = PAD + BOX / 2;
  const cy = PAD + BOX / 2 + 14;
  let inner: ReactNode = null;

  if (shape === "cube" || shape === "rectangular-prism") {
    const isCube = shape === "cube";
    const [w, h, d] = isCube ? scaleDims([props.side ?? 1, props.side ?? 1, props.side ?? 1]) : scaleDims([props.length ?? 1, props.height ?? 1, props.width ?? 1]);
    const x0 = cx - w / 2 - SKEW_X / 2;
    const y0 = cy + h / 2 - SKEW_Y / 2 - h;
    const skx = Math.min(SKEW_X, d * 0.6 || SKEW_X);
    const sky = Math.min(SKEW_Y, d * 0.35 || SKEW_Y);
    inner = (
      <g>
        {/* top face */}
        <polygon points={`${x0},${y0} ${x0 + w},${y0} ${x0 + w + skx},${y0 - sky} ${x0 + skx},${y0 - sky}`} className="fill-blue-500/30 stroke-blue-700 dark:fill-blue-400/25 dark:stroke-blue-300" />
        {/* right face */}
        <polygon points={`${x0 + w},${y0} ${x0 + w},${y0 + h} ${x0 + w + skx},${y0 + h - sky} ${x0 + w + skx},${y0 - sky}`} className="fill-blue-600/40 stroke-blue-700 dark:fill-blue-500/35 dark:stroke-blue-300" />
        {/* front face */}
        <rect x={x0} y={y0} width={w} height={h} className="fill-blue-600/25 stroke-blue-700 dark:fill-blue-400/20 dark:stroke-blue-300" />
      </g>
    );
  } else if (shape === "sphere") {
    const r = scaleDims([props.radius ?? 1], BOX / 2)[0];
    inner = (
      <g>
        <circle cx={cx} cy={cy} r={r} className="fill-amber-500/25 stroke-amber-600 dark:fill-amber-400/20 dark:stroke-amber-300" />
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.32} className="fill-none stroke-amber-600 dark:stroke-amber-300" strokeDasharray="3 3" opacity={0.7} />
      </g>
    );
  } else if (shape === "cylinder") {
    const [r, h] = scaleDims([props.radius ?? 1, props.height ?? 1], BOX / 2);
    const ry = Math.min(r * 0.35, 18);
    const top = cy - h / 2;
    const bottom = cy + h / 2;
    inner = (
      <g className="fill-emerald-500/25 stroke-emerald-600 dark:fill-emerald-400/20 dark:stroke-emerald-300">
        <path d={`M${cx - r},${top} A${r},${ry} 0 0 0 ${cx + r},${top} L${cx + r},${bottom} A${r},${ry} 0 0 1 ${cx - r},${bottom} Z`} />
        <ellipse cx={cx} cy={top} rx={r} ry={ry} />
      </g>
    );
  } else if (shape === "cone") {
    const [r, h] = scaleDims([props.radius ?? 1, props.height ?? 1], BOX / 2);
    const ry = Math.min(r * 0.35, 18);
    const bottom = cy + h / 2;
    const apex = bottom - h;
    inner = (
      <g className="fill-rose-500/25 stroke-rose-600 dark:fill-rose-400/20 dark:stroke-rose-300">
        <path d={`M${cx - r},${bottom} L${cx},${apex} L${cx + r},${bottom} A${r},${ry} 0 0 1 ${cx - r},${bottom} Z`} />
        <ellipse cx={cx} cy={bottom} rx={r} ry={ry} />
      </g>
    );
  } else if (shape === "square-pyramid") {
    const [b, h] = scaleDims([props.baseSide ?? 1, props.height ?? 1], BOX);
    const skx = Math.min(b * 0.3, SKEW_X);
    const sky = Math.min(b * 0.18, SKEW_Y);
    const bottom = cy + h / 3;
    const apex = bottom - h;
    const bx0 = cx - b / 2;
    inner = (
      <g className="fill-violet-500/25 stroke-violet-600 dark:fill-violet-400/20 dark:stroke-violet-300">
        <polygon points={`${bx0},${bottom} ${bx0 + b},${bottom} ${bx0 + b + skx},${bottom - sky} ${bx0 + skx},${bottom - sky}`} />
        <polygon points={`${bx0},${bottom} ${cx},${apex} ${bx0 + skx},${bottom - sky}`} opacity={0.85} />
        <polygon points={`${bx0 + b},${bottom} ${cx},${apex} ${bx0 + b + skx},${bottom - sky}`} opacity={0.7} />
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${PAD * 2 + BOX} ${PAD * 2 + BOX}`} className="mx-auto block h-auto w-full max-w-[180px] text-current" aria-hidden="true">
      {inner}
    </svg>
  );
}
