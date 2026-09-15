"use client";
import { useTranslations } from "next-intl";

const N_SECTORS = 8;
const R = 46;
const CX = 60;
const CY = 60;

function sectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = { x: cx + r * Math.cos(startAngle), y: cy + r * Math.sin(startAngle) };
  const end = { x: cx + r * Math.cos(endAngle), y: cy + r * Math.sin(endAngle) };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

const COLORS = ["#3b82f6", "#60a5fa", "#3b82f6", "#60a5fa", "#3b82f6", "#60a5fa", "#3b82f6", "#60a5fa"];

/**
 * The classic "unroll the pie slices" proof sketch for Area = πr²: the same 8
 * alternating-colored sectors that make up the circle on the left are laid
 * out edge-to-edge on the right, approximating a base-πr, height-r parallelogram
 * (rectangle in the limit as sector count → ∞) — that parallelogram's area,
 * base × height = πr × r = πr², is exactly the circle's area formula.
 */
export default function CircleAreaDiagram() {
  const t = useTranslations("tools.circle-calculator.areaDiagram");
  const step = (2 * Math.PI) / N_SECTORS;

  const sectors = Array.from({ length: N_SECTORS }, (_, i) => ({
    path: sectorPath(CX, CY, R, i * step - Math.PI / 2, (i + 1) * step - Math.PI / 2),
    color: COLORS[i],
  }));

  const stripWidth = 200;
  const stripHeight = R;
  const wedgeWidth = stripWidth / N_SECTORS;
  const wedges = Array.from({ length: N_SECTORS }, (_, i) => {
    const flip = i % 2 === 1;
    const x = i * wedgeWidth;
    const points = flip
      ? `${x},0 ${x + wedgeWidth},0 ${x + wedgeWidth / 2},${stripHeight}`
      : `${x},${stripHeight} ${x + wedgeWidth},${stripHeight} ${x + wedgeWidth / 2},0`;
    return { points, color: COLORS[i] };
  });

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-6 overflow-x-auto">
        <svg viewBox="0 0 120 120" role="img" aria-label={t("areaSectorsCaption")} className="h-auto w-28">
          {sectors.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} fillOpacity={0.75} stroke="white" strokeWidth={1} className="dark:stroke-zinc-900" />
          ))}
        </svg>

        <span className="text-lg text-zinc-400 dark:text-zinc-500">→</span>

        <div className="flex flex-col items-center">
          <svg viewBox={`0 0 ${stripWidth} ${stripHeight}`} role="img" className="h-auto w-52">
            {wedges.map((w, i) => (
              <polygon key={i} points={w.points} fill={w.color} fillOpacity={0.75} stroke="white" strokeWidth={1} className="dark:stroke-zinc-900" />
            ))}
          </svg>
          <div className="mt-1 flex w-52 justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
            <span>{t("areaHeightLabel")}</span>
            <span>{t("areaBaseLabel")}</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{t("areaSectorsCaption")}</figcaption>
    </figure>
  );
}
