"use client";
import { useTranslations } from "next-intl";
import B64IndicatorCard, { B64IndicatorUnavailable } from "./B64IndicatorCard";
import { useB64Model } from "./B64LiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const TOP = 26;
const BASE = H - 40;

/**
 * Type #1 (Labeled Bar Chart): how the Base64 text spreads over its alphabet — 26 capitals, 26
 * small letters, 10 digits, 2 symbols ("+ /" or "- _") and padding — against the share a perfectly
 * random byte stream would give each part.
 */
export default function B64AlphabetBars() {
  const t = useTranslations("tools.base64-tool.education.lab.alphabet");
  const { draft, a, f, pct } = useB64Model();
  if (!a) return <B64IndicatorUnavailable title={t("title")} />;

  const body = a.textLength - a.padding;
  const parts = [
    { key: "upper", v: a.alphabet.upper, ideal: 26 / 64 },
    { key: "lower", v: a.alphabet.lower, ideal: 26 / 64 },
    { key: "digits", v: a.alphabet.digits, ideal: 10 / 64 },
    { key: "symbols", v: a.alphabet.symbols, ideal: 2 / 64 },
    { key: "padding", v: a.alphabet.padding, ideal: 0 },
  ];
  const peak = Math.max(...parts.map((p) => Math.max(p.v, p.ideal * body)), 1);
  const slot = W / parts.length;
  const y = (v: number) => BASE - (v / peak) * (BASE - TOP);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {parts.map((p, i) => {
        const x = i * slot + slot * 0.2;
        const w = slot * 0.6;
        const ideal = p.ideal * body;
        return (
          <g key={p.key}>
            <rect x={x} y={y(p.v)} width={w} height={BASE - y(p.v)} rx={4} className={p.key === "padding" ? "fill-rose-500 dark:fill-rose-400" : "fill-blue-600 dark:fill-blue-400"} />
            {ideal > 0 && <line x1={x - 4} y1={y(ideal)} x2={x + w + 4} y2={y(ideal)} strokeWidth={2} strokeDasharray="3 2" className="stroke-amber-500" />}
            <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={y(Math.max(p.v, ideal)) - 6} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(p.v)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={BASE + 16} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
              {t(p.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={BASE + 31} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-400 dark:fill-zinc-500">
              {p.key === "upper" ? "A–Z" : p.key === "lower" ? "a–z" : p.key === "digits" ? "0–9" : p.key === "symbols" ? (draft.variant === "urlSafe" ? "- _" : "+ /") : "="}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <B64IndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("chars"), value: f(a.textLength) },
        { label: t("distinct"), value: `${f(new Set(a.standard.replace(/=+$/, "")).size)} / 64` },
        { label: t("entropy"), value: `${f(a.entropy, 3)} / 6 ${t("bitsPerChar")}` },
        { label: t("letters"), value: pct(a.alphabet.upper + a.alphabet.lower, body) },
        { label: t("efficiency"), value: pct(a.entropy, 6), emphasize: true },
      ]}
    />
  );
}
