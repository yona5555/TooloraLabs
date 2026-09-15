type CourseSegment = {
  label: string;
  qualityPoints: number;
  gpa: number;
};

type GpaCourseContributionBarProps = {
  segments: CourseSegment[];
  caption: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 28;
const HEIGHT = BAR_HEIGHT + 20;

function colorForGpa(gpa: number): string {
  if (gpa >= 3.5) return "fill-emerald-500 dark:fill-emerald-400";
  if (gpa >= 3.0) return "fill-blue-500 dark:fill-blue-400";
  if (gpa >= 2.0) return "fill-amber-500 dark:fill-amber-400";
  return "fill-red-500 dark:fill-red-400";
}

export default function GpaCourseContributionBar({ segments, caption }: GpaCourseContributionBarProps) {
  const total = Math.max(
    segments.reduce((sum, s) => sum + s.qualityPoints, 0),
    0.01,
  );
  const rects = segments.reduce<{ x: number; w: number; label: string; colorClass: string }[]>((acc, s) => {
    const w = (s.qualityPoints / total) * WIDTH;
    const x = acc.length > 0 ? acc[acc.length - 1].x + acc[acc.length - 1].w : 0;
    acc.push({ x, w, label: s.label, colorClass: colorForGpa(s.gpa) });
    return acc;
  }, []);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 260 }}>
          <rect x={0} y={0} width={WIDTH} height={BAR_HEIGHT} rx={6} className="fill-zinc-100 dark:fill-zinc-800" />
          {rects.map((r, i) => (
            <rect key={i} x={r.x} y={0} width={Math.max(r.w - 1, 0)} height={BAR_HEIGHT} rx={r.w < 6 ? 0 : 4} className={r.colorClass} />
          ))}
          {rects.map(
            (r, i) =>
              r.w > 34 && (
                <text key={i} x={r.x + r.w / 2} y={BAR_HEIGHT / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-white">
                  {r.label}
                </text>
              ),
          )}
        </svg>
      </div>
      <figcaption className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
