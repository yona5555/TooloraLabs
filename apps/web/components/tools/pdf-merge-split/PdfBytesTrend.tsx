"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import PdfIndicatorCard, { PdfIndicatorUnavailable } from "./PdfIndicatorCard";
import { formatBytes, usePdfModel } from "./PdfLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 220;
const L = 46;
const R = 10;
const T = 14;
const B = 32;

/**
 * Type #7 (Trend Line with Highlighted Reference Point): cumulative bytes along the output, page by
 * page, using each source's measured bytes per page; steepest stretches are the heaviest pages.
 */
export default function PdfBytesTrend() {
  const t = useTranslations("tools.pdf-merge-split.education.lab.trend");
  const { draft, ready, pages, sources, f } = usePdfModel();
  if (!ready || pages.length === 0) return <PdfIndicatorUnavailable title={t("title")} />;

  const perPage =
    draft.mode === "merge"
      ? draft.mergeDocs.map((d) => d.bytes / Math.max(1, d.pageCount))
      : sources.map((_, i) => (draft.outputSizes[i] ?? 0) / Math.max(1, pages.filter((p) => p.source === i).length));
  const cum = pages.reduce<number[]>((acc, p) => [...acc, (acc[acc.length - 1] ?? 0) + perPage[p.source]], []);
  const total = cum[cum.length - 1] || 1;
  const n = pages.length;
  const x = (i: number) => L + (i / n) * (W - L - R);
  const y = (v: number) => Math.round((H - B - (v / total) * (H - B - T)) * 100) / 100;
  const line = [`M ${x(0)} ${y(0)}`, ...cum.map((v, i) => `L ${x(i + 1)} ${y(v)}`)].join(" ");
  const heavy = perPage.indexOf(Math.max(...perPage));

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[0, total / 2, total].map((v, k) => (
        <g key={k}>
          <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
          <text style={{ fontSize: svgPx(12) }} x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
            {formatBytes(v)}
          </text>
        </g>
      ))}
      {[0, n].map((v) => (
        <text style={{ fontSize: svgPx(12) }} key={v} x={x(v)} y={H - B + 16} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
          {v}
        </text>
      ))}
      <text style={{ fontSize: svgPx(12) }} x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
      <path d={line} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      {cum.map((v, i) => (
        <circle key={i} cx={x(i + 1)} cy={y(v)} r={pages[i].source === heavy ? 4.5 : 3} className={pages[i].source === heavy ? "fill-amber-500" : "fill-blue-600 dark:fill-blue-400"} />
      ))}
    </FitSvg>
  );

  return (
    <PdfIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("pages"), value: f(n) },
        { label: t("heaviest"), value: `${sources[heavy]} · ${formatBytes(perPage[heavy])}` },
        { label: t("lightest"), value: formatBytes(Math.min(...perPage)) },
        { label: t("average"), value: formatBytes(total / n) },
        { label: t("total"), value: formatBytes(total), emphasize: true },
      ]}
    />
  );
}
