"use client";
import { useTranslations } from "next-intl";
import B64IndicatorCard, { B64IndicatorUnavailable } from "./B64IndicatorCard";
import { useB64Model } from "./B64LiveContext";

const W = 340;
const H = 190;
const CX = 95;
const CY = 95;
const KINDS = [
  { key: "ascii", fill: "fill-blue-600 dark:fill-blue-400" },
  { key: "lead", fill: "fill-violet-500 dark:fill-violet-400" },
  { key: "continuation", fill: "fill-violet-300 dark:fill-violet-700" },
  { key: "control", fill: "fill-amber-500 dark:fill-amber-400" },
  { key: "invalid", fill: "fill-rose-500 dark:fill-rose-400" },
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
 * Type #6 (Donut): what the raw bytes are — printable ASCII, UTF-8 lead bytes that start a
 * multi-byte character, continuation bytes, control codes, and bytes that cannot appear in UTF-8.
 */
export default function B64ByteDonut() {
  const t = useTranslations("tools.base64-tool.education.lab.bytes");
  const { a, f, pct } = useB64Model();
  if (!a) return <B64IndicatorUnavailable title={t("title")} />;

  const vals = KINDS.map((k) => a.byteClasses[k.key]);
  const total = a.byteCount || 1;
  const cum = vals.map((_, i) => [vals.slice(0, i).reduce((s, v) => s + v, 0) / total, vals.slice(0, i + 1).reduce((s, v) => s + v, 0) / total]);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {KINDS.map((k, i) => (vals[i] > 0 ? <path key={k.key} d={ring(52, 88, cum[i][0], cum[i][1])} className={`${k.fill} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} /> : null))}
      <text x={CX} y={CY - 2} textAnchor="middle" fontSize={20} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {f(a.byteCount)}
      </text>
      <text x={CX} y={CY + 15} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("bytes")}
      </text>
      {KINDS.map((k, i) => {
        const y = 22 + i * 30;
        return (
          <g key={k.key} opacity={vals[i] ? 1 : 0.45}>
            <circle cx={208} cy={y} r={6} className={k.fill} />
            <text x={220} y={y + 4} fontSize={12} className="fill-zinc-600 dark:fill-zinc-300">
              {t(k.key)}
            </text>
            <text x={W - 4} y={y + 4} textAnchor="end" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(vals[i])}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const textLike = a.byteClasses.control === 0 && a.byteClasses.invalid === 0;
  return (
    <B64IndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("multibyteChars"), value: f(a.byteClasses.lead) },
        { label: t("avgBytes"), value: f(a.byteCount / Math.max(1, a.byteClasses.ascii + a.byteClasses.lead + a.byteClasses.control), 2) },
        { label: t("asciiShare"), value: pct(a.byteClasses.ascii, a.byteCount) },
        { label: t("kind"), value: textLike ? t("text") : t("binary") },
        { label: t("why"), value: textLike ? t("whyText") : t("whyBinary"), emphasize: true },
      ]}
    />
  );
}
