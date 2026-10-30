"use client";
import { useTranslations } from "next-intl";
import ZipIndicatorCard, { ZipIndicatorUnavailable } from "./ZipIndicatorCard";
import { formatBytes, useZipModel } from "./ZipLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 100;
const BAR_X = LABEL + 8;
const BAR_W = 170;
const ROW = 30;

/** Type #5 (Ranked Horizontal Bar List): files ranked by the bytes compression removed from each. */
export default function ZipSavedRanking() {
  const t = useTranslations("tools.zip-compressor.education.lab.ranking");
  const { ready, rows, original, compressed, pct } = useZipModel();
  if (!ready) return <ZipIndicatorUnavailable title={t("title")} />;

  const ranked = [...rows].sort((a, b) => b.saved - a.saved).slice(0, 8);
  const peak = Math.max(...ranked.map((r) => Math.abs(r.saved)), 1);
  const H = ranked.length * ROW + 4;
  const totalSaved = rows.reduce((s, r) => s + r.saved, 0);

  const svg = (
    <svg direction="ltr" width={W} height={Math.max(H, 60)} viewBox={`0 0 ${W} ${Math.max(H, 60)}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {ranked.map((r, i) => {
        const y = i * ROW;
        const w = Math.max(3, (Math.abs(r.saved) / peak) * BAR_W);
        return (
          <g key={r.name}>
            <text style={{ fontSize: svgPx(12) }}
              x={LABEL}
              y={y + 19}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              className={i === 0 ? "fill-blue-700 font-bold dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}
            >
              {r.name.length > 12 ? `${r.name.slice(0, 11)}…` : r.name}
            </text>
            <rect
              x={BAR_X}
              y={y + 6}
              width={w}
              height={ROW - 12}
              rx={3}
              className={r.saved > 0 ? (i === 0 ? "fill-blue-600 dark:fill-blue-400" : "fill-blue-300 dark:fill-blue-800") : "fill-rose-400 dark:fill-rose-600"}
            />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + w + 5} y={y + 19} fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
              {r.saved < 0 ? "+" : ""}
              {formatBytes(Math.abs(r.saved))}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const top = ranked[0];
  return (
    <ZipIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("top"), value: `${top.name} · ${formatBytes(top.saved)}` },
        { label: t("topShare"), value: pct(Math.max(0, top.saved), Math.max(1, totalSaved)) },
        { label: t("filesSaved"), value: formatBytes(totalSaved) },
        { label: t("headers"), value: formatBytes(compressed - rows.reduce((s, r) => s + r.compressed, 0)) },
        { label: t("net"), value: formatBytes(original - compressed), emphasize: true },
      ]}
    />
  );
}
