"use client";
import { useTranslations } from "next-intl";
import { CHAR_CLASSES } from "@tooloralabs/tools";
import PasswordIndicatorCard, { PasswordIndicatorUnavailable } from "./PasswordIndicatorCard";
import { CLASS_FILL, usePasswordModel } from "./PasswordLiveContext";

const W = 340;
const BAR_Y = 26;
const BAR_H = 32;
const FULL = 88;

/**
 * Type #15 (Stacked Segmented Bar): the characters every position is drawn from, split by class
 * after the ambiguity filter, measured against the tool's full 88-character set. For a passphrase,
 * the word list replaces the pool.
 */
export default function PasswordPoolBar() {
  const t = useTranslations("tools.password-generator.education.lab.pool");
  const tc = useTranslations("tools.password-generator.result.class");
  const { draft, s, f } = usePasswordModel();
  if (!s.valid) return <PasswordIndicatorUnavailable title={t("title")} />;

  const words = draft.mode === "passphrase";
  const parts = words ? [] : CHAR_CLASSES.filter((c) => s.pool[c] > 0);
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((sum, c) => sum + s.pool[c], 0));
  const H = BAR_Y + BAR_H + 22 + 4 * 22;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text x={0} y={14} fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {words ? t("axisWords", { n: f(s.wordListSize) }) : t("axis", { n: s.poolSize, full: FULL })}
      </text>
      <rect x={0} y={BAR_Y} width={W} height={BAR_H} rx={5} className="fill-zinc-100 dark:fill-zinc-800" />
      {words ? (
        <rect x={0} y={BAR_Y} width={W} height={BAR_H} rx={5} className="fill-violet-500 dark:fill-violet-400" />
      ) : (
        parts.map((c, i) => <rect key={c} x={(starts[i] / FULL) * W} y={BAR_Y} width={Math.max(0, (s.pool[c] / FULL) * W - 1.5)} height={BAR_H} rx={4} className={CLASS_FILL[c]} />)
      )}
      {CHAR_CLASSES.map((c, i) => {
        const y = BAR_Y + BAR_H + 30 + i * 22;
        const on = !words && s.pool[c] > 0;
        return (
          <g key={c} opacity={on || words ? 1 : 0.45}>
            <circle cx={6} cy={y - 4} r={6} className={words ? "fill-zinc-300 dark:fill-zinc-600" : CLASS_FILL[c]} />
            <text x={20} y={y} fontSize={12} className="fill-zinc-600 dark:fill-zinc-300">
              {tc(c)}
            </text>
            <text x={W} y={y} textAnchor="end" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {words ? "—" : on ? f(s.pool[c]) : t("off")}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <PasswordIndicatorCard
      title={t("title")}
      intro={t(words ? "introWords" : "intro")}
      indicator={svg}
      rows={[
        { label: t("size"), value: f(s.poolSize) },
        { label: t("classes"), value: words ? "—" : f(parts.length) },
        {
          label: t("removed"),
          value: words ? "—" : f(CHAR_CLASSES.reduce((sum, c) => sum + (s.pool[c] > 0 ? ({ uppercase: 26, lowercase: 26, numbers: 10, symbols: 26 } as const)[c] - s.pool[c] : 0), 0)),
        },
        { label: t("perSymbol"), value: `${f(s.bitsPerSymbol, 2)} ${t("bits")}` },
        { label: t("coverage"), value: words ? "—" : `${f((s.poolSize / FULL) * 100, 1)}%`, emphasize: true },
      ]}
    />
  );
}
