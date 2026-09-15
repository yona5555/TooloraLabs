"use client";
import { useTranslations } from "next-intl";
import { formatClock, type MultipointSegment } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

type MultipointSplitsChartProps = {
  segments: MultipointSegment[];
};

const WIDTH = 400;
const BAR_HEIGHT = 22;
const GAP = 8;
const LABEL_WIDTH = 56;
const TRACK_WIDTH = WIDTH - LABEL_WIDTH;

/**
 * Bar-per-segment view of the same split data already in MultipointResult's table, so the
 * relative pacing pattern (even splits vs. positive/negative split, one slow segment) is visible
 * at a glance instead of requiring a left-to-right scan of numbers. Fastest/slowest segment
 * highlighted; bar length is inverted (shorter bar = faster pace) since a longer bar reading as
 * "worse" matches how a runner intuitively reads a splits chart.
 */
export default function MultipointSplitsChart({ segments }: MultipointSplitsChartProps) {
  const t = useTranslations("tools.pace-calculator.multipointSplitsChart");

  if (segments.length < 2) return null;

  const paces = segments.map((s) => s.paceSecondsPerUnit);
  const minPace = Math.min(...paces);
  const maxPace = Math.max(...paces);
  const range = maxPace - minPace || 1;
  const height = segments.length * (BAR_HEIGHT + GAP) - GAP + 20;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("caption")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={t("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          {segments.map((seg, i) => {
            const y = i * (BAR_HEIGHT + GAP);
            const fraction = (seg.paceSecondsPerUnit - minPace) / range;
            const barWidth = Math.max(TRACK_WIDTH * (0.35 + fraction * 0.65), 6);
            const isFastest = seg.paceSecondsPerUnit === minPace && minPace !== maxPace;
            const isSlowest = seg.paceSecondsPerUnit === maxPace && minPace !== maxPace;
            const fill = isFastest ? "#22c55e" : isSlowest ? "#f59e0b" : "currentColor";
            const fillOpacity = isFastest || isSlowest ? 1 : 0.35;

            return (
              <g key={`${seg.fromIndex}-${seg.toIndex}`}>
                <text x={LABEL_WIDTH - 8} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} textAnchor="end" fill="currentColor" opacity={0.7}>
                  {seg.fromIndex + 1}→{seg.toIndex + 1}
                </text>
                <rect x={LABEL_WIDTH} y={y} width={TRACK_WIDTH} height={BAR_HEIGHT} rx={4} className="fill-zinc-100 dark:fill-zinc-800" />
                <rect x={LABEL_WIDTH} y={y} width={barWidth} height={BAR_HEIGHT} rx={4} fill={fill} fillOpacity={fillOpacity} />
                <text x={LABEL_WIDTH + TRACK_WIDTH + 4} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} fill="currentColor" opacity={0.7}>
                  {formatClock(seg.paceSecondsPerUnit)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {minPace !== maxPace && (
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {t("legend", { fastest: formatClock(minPace), slowest: formatClock(maxPace) })}
        </p>
      )}
    </SectionCard>
  );
}
