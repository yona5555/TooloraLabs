"use client";
import { useTranslations } from "next-intl";
import { PT_TO_MM } from "@tooloralabs/tools";
import PdfIndicatorCard, { PdfIndicatorUnavailable } from "./PdfIndicatorCard";
import { usePdfModel } from "./PdfLiveContext";

const W = 340;
const H = 210;

/**
 * Type #11 (Side-by-Side Equivalence): every distinct page size in the output drawn to the same scale
 * and overlaid at one corner, so A4 against Letter (or any other mix) shows exactly where they differ.
 */
export default function PdfPaperCompare() {
  const t = useTranslations("tools.pdf-merge-split.education.lab.compare");
  const tp = useTranslations("tools.pdf-merge-split.education.lab.paper");
  const { ready, pages, f } = usePdfModel();
  if (!ready || pages.length === 0) return <PdfIndicatorUnavailable title={t("title")} />;

  const unique = [...new Map(pages.map((p) => [`${Math.round(p.width)}x${Math.round(p.height)}`, p])).values()].slice(0, 4);
  const maxW = Math.max(...unique.map((p) => p.width));
  const maxH = Math.max(...unique.map((p) => p.height));
  const s = Math.min((W - 150) / maxW, (H - 20) / maxH);
  const CLS = ["stroke-blue-600 dark:stroke-blue-400", "stroke-emerald-600 dark:stroke-emerald-400", "stroke-amber-500", "stroke-rose-500"];
  const FILL = ["fill-blue-600 dark:fill-blue-400", "fill-emerald-600 dark:fill-emerald-400", "fill-amber-500", "fill-rose-500"];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {unique.map((p, i) => (
        <rect
          key={i}
          x={10}
          y={H - 10 - p.height * s}
          width={p.width * s}
          height={p.height * s}
          rx={2}
          fillOpacity={0.14}
          strokeWidth={2.5}
          strokeDasharray={i ? "6 4" : undefined}
          className={`${FILL[i]} ${CLS[i]}`}
        />
      ))}
      {unique.map((p, i) => (
        <g key={i}>
          <circle cx={W - 132} cy={24 + i * 40} r={6} className={FILL[i]} />
          <text x={W - 120} y={28 + i * 40} fontSize={12} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
            {p.paper === "other" ? tp("other") : p.paper}
          </text>
          <text x={W - 120} y={44 + i * 40} fontSize={11} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
            {f(p.width * PT_TO_MM, 0)} × {f(p.height * PT_TO_MM, 0)} mm
          </text>
        </g>
      ))}
    </svg>
  );

  const a = unique[0];
  const b = unique[1];
  return (
    <PdfIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("sizes"), value: f(unique.length) },
        { label: t("first"), value: `${f(a.width, 0)} × ${f(a.height, 0)} pt` },
        { label: t("inches"), value: `${f(a.width / 72, 2)} × ${f(a.height / 72, 2)} in` },
        { label: t("diff"), value: b ? `${f((b.width - a.width) * PT_TO_MM, 1)} × ${f((b.height - a.height) * PT_TO_MM, 1)} mm` : "—" },
        { label: t("area"), value: b ? `${f(((b.width * b.height) / (a.width * a.height)) * 100, 1)}%` : "100%", emphasize: true },
      ]}
    />
  );
}
