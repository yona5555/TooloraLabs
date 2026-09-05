type Props = {
  a11: number;
  a12: number;
  a21: number;
  a22: number;
  color: string;
  label: string;
  caption: string;
  /** When set, the transformed parallelogram's area is shaded and labeled with the determinant's value. */
  areaLabel?: string;
};

const WIDTH = 260;
const HEIGHT = 220;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const PADDING = 30;

/**
 * The single picture that makes a matrix concrete: the unit square (dashed,
 * gray) and the parallelogram it becomes after the matrix acts on it. The
 * square's corners are (0,0), (1,0), (1,1), (0,1); its image is (0,0),
 * (a11,a21), (a11+a12,a21+a22), (a12,a22) — i.e. where the matrix sends the
 * two basis vectors î=(1,0) and ĵ=(0,1), which are exactly the matrix's
 * columns.
 */
export default function MatrixTransformDiagram({ a11, a12, a21, a22, color, label, caption, areaLabel }: Props) {
  const corners = [
    { x: 0, y: 0 },
    { x: a11, y: a21 },
    { x: a11 + a12, y: a21 + a22 },
    { x: a12, y: a22 },
  ];
  const maxExtent = Math.max(...corners.map((c) => Math.max(Math.abs(c.x), Math.abs(c.y))), 1);
  const scale = (Math.min(CENTER_X, CENTER_Y) - PADDING) / maxExtent;
  const toSvg = (x: number, y: number) => ({ px: CENTER_X + x * scale, py: CENTER_Y - y * scale });

  const unitSquare = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ].map((p) => toSvg(p.x, p.y));

  const image = corners.map((p) => toSvg(p.x, p.y));
  const iTip = toSvg(a11, a21);
  const jTip = toSvg(a12, a22);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-xs">
          <line x1={0} y1={CENTER_Y} x2={WIDTH} y2={CENTER_Y} stroke="currentColor" strokeWidth={1} opacity={0.15} />
          <line x1={CENTER_X} y1={0} x2={CENTER_X} y2={HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.15} />

          <polygon
            points={unitSquare.map((p) => `${p.px},${p.py}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            className="text-zinc-400 dark:text-zinc-500"
          />

          <polygon points={image.map((p) => `${p.px},${p.py}`).join(" ")} className={color} fillOpacity={0.18} stroke="currentColor" strokeWidth={2} />

          <circle cx={iTip.px} cy={iTip.py} r={3} className={color} fill="currentColor" />
          <circle cx={jTip.px} cy={jTip.py} r={3} className={color} fill="currentColor" />

          {areaLabel && (
            <text
              x={(image[0].px + image[1].px + image[2].px + image[3].px) / 4}
              y={(image[0].py + image[1].py + image[2].py + image[3].py) / 4}
              fontSize={11}
              fontWeight={700}
              textAnchor="middle"
              className={color}
            >
              {areaLabel}
            </text>
          )}

          <text x={image[2].px + 4} y={image[2].py - 4} fontSize={10} className={color}>
            {label}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
