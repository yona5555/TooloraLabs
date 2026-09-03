import type { ReactNode } from "react";
import type { AreaShape } from "@tooloralabs/tools";

type Props = {
  shape: AreaShape;
  side?: number;
  width?: number;
  height?: number;
  base?: number;
  radius?: number;
  semiMajorAxis?: number;
  semiMinorAxis?: number;
  base1?: number;
  base2?: number;
  angleDegrees?: number;
};

const BOX = 150;
const PAD = 34;

/** Scales a set of raw dimensions into the drawing box while preserving their relative ratio. */
function scaleDims(dims: number[], box = BOX): number[] {
  const max = Math.max(...dims, 1e-9);
  const factor = box / max;
  return dims.map((v) => Math.max(v * factor, 4));
}

/**
 * Live, proportionally-scaled sketch of the currently selected shape, redrawn from the
 * user's own entered dimensions (unlike the static concept diagram above the input panel).
 * Ratios are preserved but not to an absolute scale, since dimensions can range from
 * fractions of a unit to the thousands — the point is to show shape and proportion, not a ruler.
 */
export default function AreaLiveShape(props: Props) {
  const { shape } = props;
  const W = BOX + PAD * 2;
  const H = BOX + PAD * 2;

  let inner: ReactNode = null;

  if (shape === "square") {
    const s = scaleDims([props.side ?? 1])[0];
    inner = <rect x={(BOX - s) / 2} y={(BOX - s) / 2} width={s} height={s} />;
  } else if (shape === "rectangle") {
    const [w, h] = scaleDims([props.width ?? 1, props.height ?? 1]);
    inner = <rect x={(BOX - w) / 2} y={(BOX - h) / 2} width={w} height={h} />;
  } else if (shape === "triangle") {
    const [b, h] = scaleDims([props.base ?? 1, props.height ?? 1]);
    const x0 = (BOX - b) / 2;
    const y0 = (BOX - h) / 2;
    inner = <polygon points={`${x0},${y0 + h} ${x0 + b},${y0 + h} ${x0 + b * 0.35},${y0}`} />;
  } else if (shape === "parallelogram") {
    const [b, h] = scaleDims([props.base ?? 1, props.height ?? 1]);
    const skew = Math.min(b * 0.3, 20);
    const x0 = (BOX - b - skew) / 2;
    const y0 = (BOX - h) / 2;
    inner = <polygon points={`${x0 + skew},${y0} ${x0 + b + skew},${y0} ${x0 + b},${y0 + h} ${x0},${y0 + h}`} />;
  } else if (shape === "circle") {
    const r = scaleDims([props.radius ?? 1], BOX / 2)[0];
    inner = <circle cx={BOX / 2} cy={BOX / 2} r={r} />;
  } else if (shape === "ellipse") {
    const [a, b] = scaleDims([props.semiMajorAxis ?? 1, props.semiMinorAxis ?? 1], BOX / 2);
    inner = <ellipse cx={BOX / 2} cy={BOX / 2} rx={a} ry={b} />;
  } else if (shape === "trapezoid") {
    const [b1, b2, h] = scaleDims([props.base1 ?? 1, props.base2 ?? 1, props.height ?? 1]);
    const cx = BOX / 2;
    const y0 = (BOX - h) / 2;
    inner = (
      <polygon
        points={`${cx - b1 / 2},${y0 + h} ${cx + b1 / 2},${y0 + h} ${cx + b2 / 2},${y0} ${cx - b2 / 2},${y0}`}
      />
    );
  } else if (shape === "sector") {
    const r = scaleDims([props.radius ?? 1], BOX / 2)[0];
    const angle = Math.min(Math.max(props.angleDegrees ?? 90, 1), 360);
    const cx = BOX / 2;
    const cy = BOX / 2;
    const startAngle = -90 - angle / 2;
    const endAngle = startAngle + angle;
    const toXY = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    };
    const [x1, y1] = toXY(startAngle);
    const [x2, y2] = toXY(endAngle);
    const largeArc = angle > 180 ? 1 : 0;
    inner = angle >= 359.99 ? <circle cx={cx} cy={cy} r={r} /> : <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`} />;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[180px] text-current" aria-hidden="true">
      <g transform={`translate(${PAD},${PAD})`} className="fill-blue-600/25 stroke-blue-700 dark:fill-blue-400/25 dark:stroke-blue-300" strokeWidth={2} strokeLinejoin="round">
        {inner}
      </g>
    </svg>
  );
}
