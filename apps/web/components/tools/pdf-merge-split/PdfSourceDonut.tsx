"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import PdfIndicatorCard, { PdfIndicatorUnavailable } from "./PdfIndicatorCard";
import { SOURCE_FILL, usePdfModel } from "./PdfLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 190;
const CX = 95;
const CY = 95;

function ring(r0: number, r1: number, t0: number, t1: number) {
  const span = Math.min(t1 - t0, 0.9999);
  const a0 = t0 * 2 * Math.PI - Math.PI / 2;
  const a1 = (t0 + span) * 2 * Math.PI - Math.PI / 2;
  const lg = span > 0.5 ? 1 : 0;
  const p = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${lg} 0 ${p(r0, a0)} Z`;
}

/** Type #6 (Donut): how the output's pages divide between the input files (merge) or the parts (split). */
export default function PdfSourceDonut() {
  const t = useTranslations("tools.pdf-merge-split.education.lab.share");
  const { draft, ready, pages, sources, f, pct } = usePdfModel();
  if (!ready || pages.length === 0) return <PdfIndicatorUnavailable title={t("title")} />;

  const counts = sources.map((_, i) => pages.filter((p) => p.source === i).length);
  const total = pages.length;
  const cum = counts.map((_, i) => [counts.slice(0, i).reduce((s, v) => s + v, 0) / total, counts.slice(0, i + 1).reduce((s, v) => s + v, 0) / total]);
  const shown = sources.slice(0, 6);

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {counts.map((c, i) =>
        c > 0 ? <path key={i} d={ring(52, 88, cum[i][0], cum[i][1])} className={`${SOURCE_FILL[i % SOURCE_FILL.length]} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} /> : null,
      )}
      <text style={{ fontSize: svgPx(20) }} x={CX} y={CY - 2} textAnchor="middle" fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {f(total)}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={CX} y={CY + 15} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("pages")}
      </text>
      {shown.map((s, i) => {
        const y = 22 + i * 28;
        return (
          <g key={i}>
            <circle cx={208} cy={y} r={6} className={SOURCE_FILL[i % SOURCE_FILL.length]} />
            <text style={{ fontSize: svgPx(12) }} x={220} y={y + 4} fontFamily="var(--font-mono)" className="fill-zinc-600 dark:fill-zinc-300">
              {s.length > 12 ? `${s.slice(0, 11)}…` : s}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W - 4} y={y + 4} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(counts[i])}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  const big = counts.indexOf(Math.max(...counts));
  return (
    <PdfIndicatorCard
      title={t("title")}
      intro={t(draft.mode === "merge" ? "introMerge" : "introSplit")}
      indicator={<PhoneMini slot={1} title={t("title")}>{svg}</PhoneMini>}
      rows={[
        { label: draft.mode === "merge" ? t("files") : t("parts"), value: f(sources.length) },
        { label: t("largest"), value: `${sources[big]} · ${f(counts[big])}` },
        { label: t("largestShare"), value: pct(counts[big], total) },
        { label: t("average"), value: f(total / Math.max(1, sources.length), 2) },
        { label: t("total"), value: f(total), emphasize: true },
      ]}
    />
  );
}
