"use client";
import { useTranslations } from "next-intl";
import ZipIndicatorCard, { ZipIndicatorUnavailable } from "./ZipIndicatorCard";
import { useZipModel } from "./ZipLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
// room for a 10-character file name in 12px monospace, also at the up-to-1.15× a phone draws it at
const LABEL = 92;
const ROW = 30;

/**
 * Type #19 (Zone Strip): for each file, how its bytes spread over the 256 possible values in 16 bands
 * (darker = more bytes). Text crowds into the printable ASCII bands; random-looking data is flat.
 */
export default function ZipByteHeat() {
  const t = useTranslations("tools.zip-compressor.education.lab.heat");
  const { ready, rows, f } = useZipModel();
  if (!ready) return <ZipIndicatorUnavailable title={t("title")} />;

  const shown = rows.slice(0, 6);
  const cw = (W - LABEL) / 16;
  const H = shown.length * ROW + 26;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {shown.map((r, i) => {
        const max = Math.max(...r.histogram, 1);
        const y = i * ROW;
        return (
          <g key={r.name}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL - 6} y={y + 19} textAnchor="end" fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
              {r.name.length > 10 ? `${r.name.slice(0, 9)}…` : r.name}
            </text>
            {r.histogram.map((c, k) => (
              <rect key={k} x={LABEL + k * cw + 0.5} y={y + 4} width={cw - 1} height={ROW - 8} rx={3} className="fill-blue-600 dark:fill-blue-400" fillOpacity={c ? 0.12 + 0.88 * (c / max) : 0.05} />
            ))}
          </g>
        );
      })}
      {[0, 4, 8, 12, 15].map((k) => (
        <text style={{ fontSize: svgPx(12) }} key={k} x={k === 15 ? W - 2 : LABEL + k * cw + cw / 2} y={H - 6} textAnchor={k === 15 ? "end" : "middle"} fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
          {k * 16}
        </text>
      ))}
    </svg>
  );

  const asciiShare = (r: (typeof rows)[number]) => (r.histogram.slice(2, 8).reduce((s, v) => s + v, 0) / Math.max(1, r.size)) * 100;
  return (
    <ZipIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        ...shown.slice(0, 3).map((r) => ({ label: r.name, value: t("ascii", { p: f(asciiShare(r), 0) }) })),
        { label: t("bands"), value: t("bandsValue") },
        { label: t("busiest"), value: `${shown[0].name} · ${f(Math.max(...shown[0].histogram.map((c) => c / Math.max(1, shown[0].size))) * 100, 1)}%`, emphasize: true },
      ]}
    />
  );
}
