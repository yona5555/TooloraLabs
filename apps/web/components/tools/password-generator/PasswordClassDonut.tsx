"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import PasswordIndicatorCard, { PasswordIndicatorUnavailable } from "./PasswordIndicatorCard";
import { CLASS_FILL, usePasswordModel } from "./PasswordLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 190;
const CX = 95;
const CY = 95;
const KEYS = ["uppercase", "lowercase", "numbers", "symbols", "other"] as const;

function ring(r0: number, r1: number, t0: number, t1: number) {
  const span = Math.min(t1 - t0, 0.9999);
  const a0 = t0 * 2 * Math.PI - Math.PI / 2;
  const a1 = (t0 + span) * 2 * Math.PI - Math.PI / 2;
  const lg = span > 0.5 ? 1 : 0;
  const p = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${lg} 0 ${p(r0, a0)} Z`;
}

/**
 * Type #6 (Multi-Ring Donut): outer ring = the classes actually present in the password on screen;
 * inner ring = the share each class would get on average from the pool. Regenerate to watch the
 * outer ring move around the inner one.
 */
export default function PasswordClassDonut() {
  const t = useTranslations("tools.password-generator.education.lab.mix");
  const tc = useTranslations("tools.password-generator.result.class");
  const { draft, s, classes, f } = usePasswordModel();
  if (!s.valid || !classes) return <PasswordIndicatorUnavailable title={t("title")} />;

  const total = [...draft.password].length;
  const outer = KEYS.map((k) => classes[k]);
  const expected = KEYS.map((k) => (k === "other" ? 0 : draft.mode === "passphrase" ? 0 : s.pool[k] / Math.max(1, s.poolSize)));
  const cum = (vals: number[]) => {
    const sum = vals.reduce((a, b) => a + b, 0) || 1;
    return vals.map((_, i) => [vals.slice(0, i).reduce((a, b) => a + b, 0) / sum, vals.slice(0, i + 1).reduce((a, b) => a + b, 0) / sum]);
  };
  const o = cum(outer);
  const e = cum(expected);
  const shown = KEYS.filter((k) => k !== "other" || classes.other > 0);

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {KEYS.map((k, i) => (outer[i] > 0 ? <path key={k} d={ring(62, 88, o[i][0], o[i][1])} className={`${CLASS_FILL[k]} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} /> : null))}
      {draft.mode === "characters" &&
        KEYS.map((k, i) =>
          expected[i] > 0 ? <path key={k} d={ring(38, 56, e[i][0], e[i][1])} className={`${CLASS_FILL[k]} stroke-white opacity-45 dark:stroke-zinc-900`} strokeWidth={1.5} /> : null,
        )}
      <text style={{ fontSize: svgPx(20) }} x={CX} y={CY + 6} textAnchor="middle" fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {f(total)}
      </text>
      {shown.map((k, i) => {
        const y = 26 + i * 28;
        return (
          <g key={k}>
            <circle cx={208} cy={y} r={6} className={CLASS_FILL[k]} />
            <text style={{ fontSize: svgPx(12) }} x={220} y={y + 4} className="fill-zinc-600 dark:fill-zinc-300">
              {tc(k)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W - 4} y={y + 4} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(classes[k])}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  const top = KEYS.reduce((m, k) => (classes[k] > classes[m] ? k : m), KEYS[0]);
  return (
    <PasswordIndicatorCard
      title={t("title")}
      intro={t(draft.mode === "passphrase" ? "introWords" : "intro")}
      indicator={<PhoneMini slot={1} title={t("title")}>{svg}</PhoneMini>}
      rows={[
        { label: t("length"), value: f(total) },
        { label: t("most"), value: `${tc(top)} · ${f((classes[top] / Math.max(1, total)) * 100, 1)}%` },
        ...(draft.mode === "characters"
          ? [
              {
                label: t("expected"),
                value: (["uppercase", "lowercase", "numbers", "symbols"] as const)
                  .filter((k) => s.pool[k] > 0)
                  .map((k) => f((s.pool[k] / s.poolSize) * total, 1))
                  .join(" / "),
              },
            ]
          : [{ label: t("separators"), value: f(classes.symbols + classes.other) }]),
        { label: t("guarantee"), value: draft.mode === "characters" ? t("guaranteeYes") : "—" },
        { label: t("classesUsed"), value: f(KEYS.filter((k) => classes[k] > 0).length), emphasize: true },
      ]}
    />
  );
}
