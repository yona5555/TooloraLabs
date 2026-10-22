"use client";
import { useTranslations } from "next-intl";
import FsIndicatorCard, { FsIndicatorUnavailable } from "./FsIndicatorCard";
import { useFsModel } from "./FsLiveContext";

const W = 340;
const LABEL = 92;
const BAR_X = LABEL + 8;
const BAR_W = 170;
const ROW = 40;

/**
 * Type #5 (Ranked Horizontal Bar List): how many standard media this size fills — 3.5" floppy
 * (1,474,560 B), CD-ROM (700 MiB), DVD-5 (4.7 GB) and single-layer Blu-ray (25 GB) — on a log scale.
 */
export default function FsMediaRanking() {
  const t = useTranslations("tools.file-size-converter.education.lab.mediaRank");
  const tm = useTranslations("tools.file-size-converter.education.lab.media");
  const { a, f } = useFsModel();
  if (!a || a.bytes === 0) return <FsIndicatorUnavailable title={t("title")} />;

  const maxLog = Math.max(...a.media.map((m) => Math.log10(Math.max(1, m.count))), 1);
  const H = a.media.length * ROW + 4;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {a.media.map((m, i) => {
        const y = i * ROW;
        const w = Math.max(4, Math.round(((Math.log10(Math.max(1, m.count)) + 0.15) / (maxLog + 0.15)) * BAR_W * 100) / 100);
        return (
          <g key={m.key}>
            <text x={LABEL} y={y + 16} textAnchor="end" fontSize={12} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {tm(m.key)}
            </text>
            <text x={LABEL} y={y + 30} textAnchor="end" fontSize={10} className="fill-zinc-400 dark:fill-zinc-500">
              {m.fill < 100 ? t("fill", { p: f(m.fill, 1) }) : ""}
            </text>
            <rect x={BAR_X} y={y + 8} width={w} height={ROW - 16} rx={4} className={m.count === 1 ? "fill-emerald-500 dark:fill-emerald-400" : "fill-blue-600 dark:fill-blue-400"} />
            <text x={BAR_X + w + 5} y={y + 24} fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              × {f(m.count, 0)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const fits = a.media.find((m) => m.count === 1);
  return (
    <FsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        ...a.media.map((m) => ({ label: tm(m.key), value: `⌈${f(a.bytes / m.capacity, 2)}⌉ = ${f(m.count, 0)}` })),
        { label: t("smallestFit"), value: fits ? tm(fits.key) : t("none"), emphasize: true },
      ]}
    />
  );
}
