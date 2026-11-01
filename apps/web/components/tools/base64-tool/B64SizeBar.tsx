"use client";
import { useTranslations } from "next-intl";
import B64IndicatorCard, { B64IndicatorUnavailable } from "./B64IndicatorCard";
import { useB64Model } from "./B64LiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const ROW_H = 30;

/**
 * Type #15 (Stacked Segmented Bar): the raw bytes against the Base64 text built from them — the
 * one-third growth, the "=" padding and, for e-mail (MIME), the line breaks every 76 characters.
 */
export default function B64SizeBar() {
  const t = useTranslations("tools.base64-tool.education.lab.size");
  const { a, f, pct } = useB64Model();
  if (!a) return <B64IndicatorUnavailable title={t("title")} />;

  const max = a.mimeLength;
  const sx = (v: number) => (v / max) * W;
  const data = Math.ceil((a.byteCount * 4) / 3);
  const pad = a.paddedLength - data;
  const rows = [
    { key: "raw", parts: [{ v: a.byteCount, cls: "fill-zinc-400 dark:fill-zinc-500" }] },
    {
      key: "base64",
      parts: [
        { v: a.byteCount, cls: "fill-blue-300 dark:fill-blue-800" },
        { v: data - a.byteCount, cls: "fill-blue-600 dark:fill-blue-400" },
        { v: pad, cls: "fill-rose-500 dark:fill-rose-400" },
      ],
    },
    {
      key: "mime",
      parts: [
        { v: a.paddedLength, cls: "fill-blue-600 dark:fill-blue-400" },
        { v: a.mimeLength - a.paddedLength, cls: "fill-amber-500 dark:fill-amber-400" },
      ],
    },
  ];
  const H = rows.length * (ROW_H + 26) + 4 * 22;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) => {
        const y = i * (ROW_H + 26);
        const total = r.parts.reduce((s, p) => s + p.v, 0);
        return (
          <g key={r.key}>
            <text style={{ fontSize: svgPx(12) }} x={0} y={y + 12} className="fill-zinc-600 dark:fill-zinc-300">
              {t(r.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W} y={y + 12} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(total)}
            </text>
            {r.parts.map((p, k) => {
              const at = sx(r.parts.slice(0, k).reduce((s, q) => s + q.v, 0));
              return p.v > 0 ? <rect key={k} x={at} y={y + 18} width={Math.max(1, sx(p.v) - 1)} height={ROW_H - 10} rx={3} className={p.cls} /> : null;
            })}
          </g>
        );
      })}
      {[
        { key: "kRaw", cls: "fill-blue-300 dark:fill-blue-800" },
        { key: "kGrowth", cls: "fill-blue-600 dark:fill-blue-400" },
        { key: "kPad", cls: "fill-rose-500 dark:fill-rose-400" },
        { key: "kBreaks", cls: "fill-amber-500 dark:fill-amber-400" },
      ].map((k, i) => (
        <g key={k.key}>
          <circle cx={6} cy={rows.length * (ROW_H + 26) + i * 22 + 2} r={6} className={k.cls} />
          <text style={{ fontSize: svgPx(12) }} x={20} y={rows.length * (ROW_H + 26) + i * 22 + 6} className="fill-zinc-600 dark:fill-zinc-300">
            {t(k.key)}
          </text>
        </g>
      ))}
    </svg>
  );

  return (
    <B64IndicatorCard
      title={t("title")}
      intro={t("intro")}
      mini={1}
      indicator={svg}
      rows={[
        { label: t("formula"), value: `4 × ⌈${f(a.byteCount)} / 3⌉ = ${f(a.paddedLength)}` },
        { label: t("padding"), value: `${pad} × "="` },
        { label: t("lines"), value: `${f(a.mimeLines)} (+${f(a.mimeLength - a.paddedLength)})` },
        { label: t("remainder"), value: `${f(a.byteCount)} mod 3 = ${a.byteCount % 3}` },
        { label: t("growth"), value: `+${pct(a.paddedLength - a.byteCount, a.byteCount)}`, emphasize: true },
      ]}
    />
  );
}
