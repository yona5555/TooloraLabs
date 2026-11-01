"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import ZipIndicatorCard, { ZipIndicatorUnavailable } from "./ZipIndicatorCard";
import { formatBytes, useZipModel } from "./ZipLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 200;
const BASE = H - 44;
const TOP = 24;

/**
 * Type #12 (Sensitivity Trio): the file data three ways — stored with no compression, as DEFLATE
 * actually wrote it, and at the order-0 entropy limit (Σ size × entropy ÷ 8) that a byte-by-byte coder
 * without memory cannot beat. DEFLATE can dip below it on text because it also exploits repeats.
 */
export default function ZipLimitTrio() {
  const t = useTranslations("tools.zip-compressor.education.lab.limit");
  const { ready, rows, pct } = useZipModel();
  if (!ready) return <ZipIndicatorUnavailable title={t("title")} />;

  const stored = rows.reduce((s, r) => s + r.size, 0);
  const actual = rows.reduce((s, r) => s + r.compressed, 0);
  const entropy = rows.reduce((s, r) => s + (r.size * r.entropy) / 8, 0);
  const vals = [
    { key: "stored", v: stored, cls: "fill-zinc-400 dark:fill-zinc-500" },
    { key: "deflate", v: actual, cls: "fill-blue-600 dark:fill-blue-400" },
    { key: "entropy", v: entropy, cls: "fill-emerald-500 dark:fill-emerald-400" },
  ];
  const peak = Math.max(...vals.map((x) => x.v), 1);
  const slot = W / 3;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {vals.map((x, i) => {
        const h = Math.max(3, (x.v / peak) * (BASE - TOP));
        const cx = i * slot + slot / 2;
        return (
          <g key={x.key}>
            <rect x={cx - 30} y={BASE - h} width={60} height={h} rx={5} className={x.cls} />
            <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE - h - 6} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {formatBytes(x.v)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 18} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
              {t(x.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 34} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-400 dark:fill-zinc-500">
              {pct(x.v, stored)}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  return (
    <ZipIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("stored"), value: formatBytes(stored) },
        { label: t("deflate"), value: formatBytes(actual) },
        { label: t("entropy"), value: formatBytes(entropy) },
        { label: t("vsLimit"), value: actual <= entropy ? t("below") : t("above", { p: pct(actual - entropy, entropy) }) },
        { label: t("gap"), value: formatBytes(Math.abs(actual - entropy)), emphasize: true },
      ]}
    />
  );
}
