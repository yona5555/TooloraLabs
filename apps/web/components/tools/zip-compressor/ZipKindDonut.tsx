"use client";
import { useTranslations } from "next-intl";
import ZipIndicatorCard, { ZipIndicatorUnavailable } from "./ZipIndicatorCard";
import { formatBytes, useZipModel } from "./ZipLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";
import { labelW } from "@/components/tool-ui/labelLayout";

const W = 340;
const H = 190;
const CX = 95;
const CY = 95;
const KINDS = [
  { key: "text", fill: "fill-blue-600 dark:fill-blue-400" },
  { key: "data", fill: "fill-emerald-600 dark:fill-emerald-400" },
  { key: "image", fill: "fill-amber-500 dark:fill-amber-400" },
  { key: "archive", fill: "fill-violet-500 dark:fill-violet-400" },
  { key: "other", fill: "fill-zinc-400 dark:fill-zinc-500" },
] as const;

function ring(r0: number, r1: number, t0: number, t1: number) {
  const span = Math.min(t1 - t0, 0.9999);
  const a0 = t0 * 2 * Math.PI - Math.PI / 2;
  const a1 = (t0 + span) * 2 * Math.PI - Math.PI / 2;
  const lg = span > 0.5 ? 1 : 0;
  const p = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${lg} 0 ${p(r0, a0)} Z`;
}

/**
 * Type #6 (Multi-Ring Donut): outer ring = original bytes by kind of file; inner ring = the same kinds
 * after compression — text and data shrink, already-compressed media barely moves.
 */
export default function ZipKindDonut() {
  const t = useTranslations("tools.zip-compressor.education.lab.kinds");
  const { ready, rows, f } = useZipModel();
  if (!ready) return <ZipIndicatorUnavailable title={t("title")} />;

  const orig = KINDS.map((k) => rows.filter((r) => r.kind === k.key).reduce((s, r) => s + r.size, 0));
  const comp = KINDS.map((k) => rows.filter((r) => r.kind === k.key).reduce((s, r) => s + r.compressed, 0));
  const cum = (vals: number[]) => {
    const total = vals.reduce((s, v) => s + v, 0) || 1;
    return vals.map((_, i) => [vals.slice(0, i).reduce((s, v) => s + v, 0) / total, vals.slice(0, i + 1).reduce((s, v) => s + v, 0) / total]);
  };
  // size change after compression: "−62%" when it shrank, "+3%" when it grew (already-compressed media
  // can), "0%" when unchanged — never "−-0%"
  const change = (i: number) => {
    if (!orig[i]) return "—";
    const saved = Math.round((1 - comp[i] / orig[i]) * 100);
    return saved === 0 ? "0%" : saved > 0 ? `−${f(saved, 0)}%` : `+${f(-saved, 0)}%`;
  };
  const co = cum(orig);
  const cc = cum(comp);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {KINDS.map((k, i) => (orig[i] > 0 ? <path key={k.key} d={ring(62, 88, co[i][0], co[i][1])} className={`${k.fill} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} /> : null))}
      {KINDS.map((k, i) => (comp[i] > 0 ? <path key={k.key} d={ring(36, 58, cc[i][0], cc[i][1])} className={`${k.fill} stroke-white opacity-60 dark:stroke-zinc-900`} strokeWidth={1.5} /> : null))}
      {KINDS.map((k, i) => {
        const y = 22 + i * 30;
        const value = change(i);
        // the change moves under its name when the two would touch (a long name on a phone) (§39)
        const under = 220 + labelW(t(k.key)) * 1.15 + 6 > W - 4 - labelW(value) * 1.15;
        return (
          <g key={k.key} opacity={orig[i] ? 1 : 0.4}>
            <circle cx={208} cy={y} r={6} className={k.fill} />
            <text style={{ fontSize: svgPx(12) }} x={220} y={y + 4} className="fill-zinc-600 dark:fill-zinc-300">
              {t(k.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={under ? 220 : W - 4} y={under ? y + 18 : y + 4} textAnchor={under ? "start" : "end"} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const top = orig.indexOf(Math.max(...orig));
  return (
    <ZipIndicatorCard
      mini={1}
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("largest"), value: `${t(KINDS[top].key)} · ${formatBytes(orig[top])}` },
        ...KINDS.map((k, i) => ({ k, i }))
          .filter(({ i }) => orig[i] > 0)
          .slice(0, 3)
          .map(({ k, i }) => ({ label: t(k.key), value: `${formatBytes(orig[i])} → ${formatBytes(comp[i])}` })),
        { label: t("kindsUsed"), value: f(orig.filter((v) => v > 0).length), emphasize: true },
      ]}
    />
  );
}
