"use client";
import { useTranslations } from "next-intl";
import FnIndicatorCard, { FnIndicatorUnavailable } from "./FnIndicatorCard";
import { useFnModel } from "./FnLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 96;
const BAR_X = LABEL + 8;
const BAR_W = 180;
const ROW = 44;
const KEYS = ["chars", "utf8", "utf16", "url"] as const;

/**
 * Type #11 (Side-by-Side Equivalence): the original and the sanitized name measured four ways —
 * characters, UTF-8 bytes (Linux and macOS limits), UTF-16 units (Windows limit) and URL-encoded length.
 */
export default function FnLengthCompare() {
  const t = useTranslations("tools.file-name-sanitizer.education.lab.compare");
  const { a, f, pct } = useFnModel();
  if (!a) return <FnIndicatorUnavailable title={t("title")} />;

  const o = a.lengths.original;
  const r = a.lengths.result;
  const peak = Math.max(...KEYS.map((k) => Math.max(o[k], r[k])), 1);
  const H = KEYS.length * ROW + 24;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <circle cx={BAR_X + 4} cy={8} r={5} className="fill-zinc-400 dark:fill-zinc-500" />
      <text style={{ fontSize: svgPx(12) }} x={BAR_X + 14} y={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("original")}
      </text>
      <circle cx={BAR_X + 100} cy={8} r={5} className="fill-emerald-500 dark:fill-emerald-400" />
      <text style={{ fontSize: svgPx(12) }} x={BAR_X + 110} y={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("sanitized")}
      </text>
      {KEYS.map((k, i) => {
        const y = 22 + i * ROW;
        const wo = Math.max(3, (o[k] / peak) * BAR_W);
        const wr = Math.max(3, (r[k] / peak) * BAR_W);
        return (
          <g key={k}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 18} textAnchor="end" fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {t(k)}
            </text>
            <rect x={BAR_X} y={y + 2} width={wo} height={14} rx={3} className="fill-zinc-400 dark:fill-zinc-500" />
            <rect x={BAR_X} y={y + 19} width={wr} height={14} rx={3} className="fill-emerald-500 dark:fill-emerald-400" />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + wo + 4} y={y + 13} fontFamily="var(--font-mono)" className="fill-zinc-600 dark:fill-zinc-300">
              {f(o[k], 0)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + wr + 4} y={y + 30} fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(r[k], 0)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <FnIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("chars"), value: `${f(o.chars, 0)} → ${f(r.chars, 0)}` },
        { label: t("utf8"), value: `${f(o.utf8, 0)} → ${f(r.utf8, 0)}` },
        { label: t("utf16"), value: `${f(o.utf16, 0)} → ${f(r.utf16, 0)}` },
        { label: t("url"), value: `${f(o.url, 0)} → ${f(r.url, 0)}` },
        { label: t("urlSaving"), value: `−${pct(o.url - r.url, o.url)}`, emphasize: true },
      ]}
    />
  );
}
