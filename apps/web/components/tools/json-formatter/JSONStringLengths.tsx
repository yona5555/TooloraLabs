"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import JSONIndicatorCard, { JSONIndicatorUnavailable } from "./JSONIndicatorCard";
import { useJSONModel } from "./JSONLiveContext";
import { clip } from "./jsonSvg";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 200;
const TOP = 26;
const BASE = H - 26;

/**
 * Type #20 (Annotated Reference Point): the distribution of string-value lengths in six bands, with
 * the mean length pinned on the axis and the longest string named in the table.
 */
export default function JSONStringLengths() {
  const t = useTranslations("tools.json-formatter.education.lab.strings");
  const { a, f } = useJSONModel();
  if (!a) return <JSONIndicatorUnavailable title={t("title")} />;
  const s = a.strings;
  if (s.count === 0) {
    return (
      <JSONIndicatorCard
        title={t("title")}
        intro={t("intro")}
        indicator={<p className="w-[21rem] max-w-full text-center text-sm text-zinc-500 dark:text-zinc-400">{t("none")}</p>}
        rows={[{ label: t("count"), value: "0", emphasize: true }]}
      />
    );
  }

  const peak = Math.max(...s.buckets.map((b) => b.count));
  const slot = W / s.buckets.length;
  const barW = slot * 0.66;
  const meanBucket = s.buckets.findIndex((b) => s.meanLength >= b.from && (b.to === null || s.meanLength <= b.to + 0.999));
  const mb = s.buckets[meanBucket];
  const within = mb.to === null ? 0.5 : (s.meanLength - mb.from) / (mb.to + 1 - mb.from);
  const meanX = meanBucket * slot + (slot - barW) / 2 + within * barW;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {s.buckets.map((b, i) => {
        const h = b.count ? Math.max(4, (b.count / peak) * (BASE - TOP - 18)) : 0;
        const x = i * slot + (slot - barW) / 2;
        return (
          <g key={i}>
            {h > 0 && <rect x={x} y={BASE - h} width={barW} height={h} rx={4} className={i === meanBucket ? "fill-emerald-600 dark:fill-emerald-400" : "fill-emerald-300 dark:fill-emerald-800"} />}
            <text style={{ fontSize: svgPx(12) }} x={x + barW / 2} y={BASE - h - 5} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(b.count)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x + barW / 2} y={BASE + 16} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
              {b.to === null ? `${b.from}+` : `${b.from}–${b.to}`}
            </text>
          </g>
        );
      })}
      <line x1={meanX} y1={TOP - 4} x2={meanX} y2={BASE} strokeDasharray="4 3" strokeWidth={1.5} className="stroke-rose-500 dark:stroke-rose-400" />
      <text style={{ fontSize: svgPx(12) }} x={Math.min(Math.max(meanX, 40), W - 40)} y={TOP - 10} textAnchor="middle" fontWeight={700} className="fill-rose-600 dark:fill-rose-300">
        {t("mean", { n: f(s.meanLength, 1) })}
      </text>
    </FitSvg>
  );

  return (
    <JSONIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("count"), value: f(s.count) },
        { label: t("shortest"), value: t("chars", { n: f(s.minLength) }) },
        { label: t("longest"), value: t("chars", { n: f(s.maxLength) }) },
        { label: t("longestText"), value: `"${clip(s.longest, 18)}"` },
        {
          label: t("meanLabel"),
          value: t("chars", { n: f(s.meanLength, 1) }),
          emphasize: true,
        },
      ]}
    />
  );
}
