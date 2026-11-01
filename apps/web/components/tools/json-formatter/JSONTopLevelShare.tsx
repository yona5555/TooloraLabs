"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import JSONIndicatorCard, { JSONIndicatorUnavailable } from "./JSONIndicatorCard";
import { formatBytes, KIND_FILL, useJSONModel } from "./JSONLiveContext";
import { clip, ringPath, turns } from "./jsonSvg";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 190;
const CX = 95;
const CY = 95;
const SHOWN = 5;

/**
 * Type #6 (Donut): which top-level member carries the weight — each root key's (or array item's)
 * share of the minified payload, coloured by its value kind; the remainder is grouped as "others".
 */
export default function JSONTopLevelShare() {
  const t = useTranslations("tools.json-formatter.education.lab.share");
  const tk = useTranslations("tools.json-formatter.education.lab.kindNames");
  const { a, f, pct } = useJSONModel();
  if (!a) return <JSONIndicatorUnavailable title={t("title")} />;
  if (a.topLevel.length === 0) {
    return (
      <JSONIndicatorCard
        title={t("title")}
        intro={t("intro")}
        indicator={<p className="w-[21rem] max-w-full text-center text-sm text-zinc-500 dark:text-zinc-400">{t("scalarRoot")}</p>}
        rows={[{ label: t("members"), value: "0", emphasize: true }]}
      />
    );
  }

  const head = a.topLevel.slice(0, SHOWN);
  const rest = a.topLevel.slice(SHOWN).reduce((s, m) => s + m.bytes, 0);
  const segs = [
    ...head.map((m) => ({
      label: m.key,
      bytes: m.bytes,
      fill: KIND_FILL[m.kind],
    })),
    ...(rest > 0
      ? [
          {
            label: t("others"),
            bytes: rest,
            fill: "fill-zinc-300 dark:fill-zinc-600",
          },
        ]
      : []),
  ];
  const total = segs.reduce((s, m) => s + m.bytes, 0);
  const arcs = turns(segs.map((s) => s.bytes));

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {segs.map((s, i) => (
        <path key={i} d={ringPath(CX, CY, 50, 88, arcs[i][0], arcs[i][1])} className={`${s.fill} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} />
      ))}
      <text style={{ fontSize: svgPx(16) }} x={CX} y={CY - 1} textAnchor="middle" fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {formatBytes(total)}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={CX} y={CY + 15} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("center", { n: a.topLevel.length })}
      </text>
      {segs.map((s, i) => {
        const y = 22 + i * 26;
        return (
          <g key={i}>
            <circle cx={208} cy={y} r={6} className={s.fill} />
            <text style={{ fontSize: svgPx(12) }} x={220} y={y + 4} fontFamily="var(--font-mono)" className="fill-zinc-600 dark:fill-zinc-300">
              {clip(s.label, 9)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W - 4} y={y + 4} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {pct(s.bytes, total)}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  const big = a.topLevel[0];
  const small = a.topLevel[a.topLevel.length - 1];
  return (
    <JSONIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("members"), value: f(a.topLevel.length) },
        {
          label: t("largest"),
          value: `${clip(big.key, 12)} · ${tk(big.kind)} · ${formatBytes(big.bytes)}`,
        },
        {
          label: t("smallest"),
          value: `${clip(small.key, 12)} · ${formatBytes(small.bytes)}`,
        },
        {
          label: t("ratio"),
          value: `× ${f(big.bytes / Math.max(1, small.bytes), 1)}`,
        },
        {
          label: t("largestShare"),
          value: pct(big.bytes, total),
          emphasize: true,
        },
      ]}
    />
  );
}
