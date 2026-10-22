"use client";
import { useTranslations } from "next-intl";
import JSONIndicatorCard, { JSONIndicatorUnavailable } from "./JSONIndicatorCard";
import { formatBytes, useJSONModel } from "./JSONLiveContext";

const W = 340;
const BAR_Y = 30;
const BAR_H = 34;

const PARTS = [
  { key: "structure", fill: "fill-zinc-400 dark:fill-zinc-500" },
  { key: "keys", fill: "fill-blue-600 dark:fill-blue-400" },
  { key: "strings", fill: "fill-emerald-500 dark:fill-emerald-400" },
  { key: "numbers", fill: "fill-amber-500 dark:fill-amber-400" },
  { key: "literals", fill: "fill-rose-500 dark:fill-rose-400" },
] as const;

/**
 * Type #15 (Stacked Segmented Bar): where every byte of the minified document goes — punctuation,
 * key names, string values, numbers and the true/false/null literals. The five parts sum exactly.
 */
export default function JSONByteComposition() {
  const t = useTranslations("tools.json-formatter.education.lab.bytes");
  const { a, f, pct } = useJSONModel();
  if (!a) return <JSONIndicatorUnavailable title={t("title")} />;

  const b = a.bytes;
  const starts = PARTS.map((_, i) => PARTS.slice(0, i).reduce((sum, q) => sum + (b[q.key] / b.total) * W, 0));
  const H = BAR_Y + BAR_H + 18 + PARTS.length * 22;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text x={0} y={16} fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis", { total: formatBytes(b.total) })}
      </text>
      {PARTS.map((p, i) => {
        const w = (b[p.key] / b.total) * W;
        const x = starts[i];
        return (
          <g key={p.key}>
            <rect x={x} y={BAR_Y} width={Math.max(0, w - 1)} height={BAR_H} rx={4} className={p.fill} />
            {w > 34 && (
              <text x={x + w / 2} y={BAR_Y + BAR_H / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-white">
                {pct(b[p.key], b.total)}
              </text>
            )}
          </g>
        );
      })}
      {PARTS.map((p, i) => {
        const y = BAR_Y + BAR_H + 26 + i * 22;
        return (
          <g key={p.key}>
            <circle cx={6} cy={y - 4} r={6} className={p.fill} />
            <text x={20} y={y} fontSize={12} className="fill-zinc-600 dark:fill-zinc-300">
              {t(p.key)}
            </text>
            <text x={W - 70} y={y} textAnchor="end" fontSize={12} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {pct(b[p.key], b.total)}
            </text>
            <text x={W} y={y} textAnchor="end" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(b[p.key])} B
            </text>
          </g>
        );
      })}
    </svg>
  );

  const payload = b.strings + b.numbers + b.literals;

  return (
    <JSONIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        {
          label: t("payload"),
          value: `${f(payload)} B (${pct(payload, b.total)})`,
        },
        {
          label: t("overhead"),
          value: `${f(b.structure + b.keys)} B (${pct(b.structure + b.keys, b.total)})`,
        },
        {
          label: t("perKey"),
          value: a.totalKeys ? `${f(b.keys / a.totalKeys, 1)} B` : "0 B",
        },
        {
          label: t("sum"),
          value: `${f(b.structure)} + ${f(b.keys)} + ${f(b.strings)} + ${f(b.numbers)} + ${f(b.literals)}`,
        },
        { label: t("total"), value: formatBytes(b.total), emphasize: true },
      ]}
    />
  );
}
