"use client";
import { useTranslations } from "next-intl";
import { collisionProbability } from "@tooloralabs/tools";
import PasswordIndicatorCard, { PasswordIndicatorUnavailable } from "./PasswordIndicatorCard";
import { usePasswordModel } from "./PasswordLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 200;
const SCENARIOS = [
  { key: "thousand", n: 1e3 },
  { key: "million", n: 1e6 },
  { key: "billion", n: 1e9 },
];

function probText(p: number, f: (v: number, m?: number) => string): string {
  if (p >= 0.001) return `${f(p * 100, p > 0.1 ? 1 : 3)}%`;
  if (p <= 0) return "0";
  const e = Math.floor(Math.log10(p));
  return `${f(p / 10 ** e, 1)}e${e}`;
}

/**
 * Type #12 (Sensitivity Trio): the chance that two passwords made with these settings ever come out
 * identical, if a thousand, a million or a billion are generated (birthday bound).
 */
export default function PasswordCollisionTrio() {
  const t = useTranslations("tools.password-generator.education.lab.collision");
  const { s, f } = usePasswordModel();
  if (!s.valid) return <PasswordIndicatorUnavailable title={t("title")} />;

  const probs = SCENARIOS.map((sc) => collisionProbability(sc.n, s.entropyBits));
  const cw = W / 3;
  // Bar height on a log scale from 10⁻³⁰ to 1.
  const hOf = (p: number) => (p <= 0 ? 2 : Math.max(2, ((Math.max(-30, Math.log10(p)) + 30) / 30) * 120));
  const safeN = Math.sqrt(2 * 2 ** s.entropyBits * 0.01);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={160} x2={W} y2={160} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {SCENARIOS.map((sc, i) => {
        const p = probs[i];
        const h = Math.round(hOf(p) * 100) / 100;
        const cx = i * cw + cw / 2;
        return (
          <g key={sc.key}>
            <rect
              x={cx - 26}
              y={160 - h}
              width={52}
              height={h}
              rx={5}
              className={p > 0.01 ? "fill-rose-500 dark:fill-rose-400" : p > 1e-9 ? "fill-amber-500 dark:fill-amber-400" : "fill-emerald-500 dark:fill-emerald-400"}
            />
            <text style={{ fontSize: svgPx(12) }} x={cx} y={160 - h - 6} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {probText(p, f)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={cx} y={178} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
              {t(sc.key)}
            </text>
          </g>
        );
      })}
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={196} textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500">
        {t("axis")}
      </text>
    </svg>
  );

  return (
    <PasswordIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        ...SCENARIOS.map((sc, i) => ({ label: t(sc.key), value: probText(probs[i], f) })),
        { label: t("formula"), value: "1 − e^(−n²/2N)" },
        { label: t("onePercent"), value: safeN > 1e15 ? `> 10¹⁵` : f(safeN, 0), emphasize: true },
      ]}
    />
  );
}
