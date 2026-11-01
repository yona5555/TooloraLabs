"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import ZipIndicatorCard, { ZipIndicatorUnavailable } from "./ZipIndicatorCard";
import { useZipModel } from "./ZipLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const BAR_Y = 26;
const BAR_H = 32;

/**
 * Type #15 (Stacked Segmented Bar): every byte of the archive, split into compressed file data, the
 * local header before each file, the central directory at the end and the 22-byte end record.
 */
export default function ZipArchiveLayout() {
  const t = useTranslations("tools.zip-compressor.education.lab.layout");
  const { draft, ready, f, pct } = useZipModel();
  const L = draft.layout;
  if (!ready || !L) return <ZipIndicatorUnavailable title={t("title")} />;

  const parts = [
    { key: "data", v: L.dataBytes, cls: "fill-blue-600 dark:fill-blue-400" },
    { key: "local", v: L.localHeaderBytes, cls: "fill-amber-500 dark:fill-amber-400" },
    { key: "central", v: L.centralDirectoryBytes, cls: "fill-violet-500 dark:fill-violet-400" },
    { key: "end", v: L.endRecordBytes, cls: "fill-rose-500 dark:fill-rose-400" },
  ];
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((s, p) => s + p.v, 0));
  const H = BAR_Y + BAR_H + 18 + parts.length * 24;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text style={{ fontSize: svgPx(12) }} x={0} y={14} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis", { n: f(L.archiveBytes) })}
      </text>
      {parts.map((p, i) => {
        const x = (starts[i] / L.archiveBytes) * W;
        const w = (p.v / L.archiveBytes) * W;
        return (
          <g key={p.key}>
            <rect x={x} y={BAR_Y} width={Math.max(1, w - 1)} height={BAR_H} rx={4} className={p.cls} />
            {w > 36 && (
              <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={BAR_Y + BAR_H / 2 + 4} textAnchor="middle" fontWeight={700} className="fill-white">
                {pct(p.v, L.archiveBytes)}
              </text>
            )}
          </g>
        );
      })}
      {parts.map((p, i) => {
        const y = BAR_Y + BAR_H + 30 + i * 24;
        return (
          <g key={p.key}>
            <circle cx={6} cy={y - 4} r={6} className={p.cls} />
            <text style={{ fontSize: svgPx(12) }} x={20} y={y} className="fill-zinc-600 dark:fill-zinc-300">
              {t(p.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W} y={y} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(p.v)} B
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  const headers = L.localHeaderBytes + L.centralDirectoryBytes + L.endRecordBytes;
  return (
    <ZipIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("entries"), value: f(L.entries.length) },
        { label: t("perFile"), value: `30 + 46 + 2 × ${t("name")}` },
        { label: t("headers"), value: `${f(headers)} B` },
        { label: t("sum"), value: `${f(L.dataBytes)} + ${f(L.localHeaderBytes)} + ${f(L.centralDirectoryBytes)} + ${f(L.endRecordBytes)}` },
        { label: t("overhead"), value: pct(headers, L.archiveBytes), emphasize: true },
      ]}
    />
  );
}
