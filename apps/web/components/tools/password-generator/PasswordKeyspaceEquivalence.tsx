"use client";
import { useTranslations } from "next-intl";
import PasswordIndicatorCard, { PasswordIndicatorUnavailable } from "./PasswordIndicatorCard";
import { usePasswordModel } from "./PasswordLiveContext";

const W = 340;
const ROW = 40;
const LABEL = 132;

/**
 * Type #11 (Side-by-Side Equivalence): the same keyspace expressed four ways — coin flips (bits),
 * six-sided dice rolls, 4-digit PINs typed in a row, and words from the 7,776-word Diceware list.
 */
export default function PasswordKeyspaceEquivalence() {
  const t = useTranslations("tools.password-generator.education.lab.equivalent");
  const { s, f } = usePasswordModel();
  if (!s.valid) return <PasswordIndicatorUnavailable title={t("title")} />;

  const rows = [
    { key: "coins", value: s.entropyBits, per: 1, cls: "fill-amber-500 dark:fill-amber-400" },
    { key: "dice", value: s.entropyBits / Math.log2(6), per: Math.log2(6), cls: "fill-rose-500 dark:fill-rose-400" },
    { key: "pins", value: s.entropyBits / Math.log2(10_000), per: Math.log2(10_000), cls: "fill-blue-600 dark:fill-blue-400" },
    { key: "diceware", value: s.entropyBits / Math.log2(7776), per: Math.log2(7776), cls: "fill-violet-500 dark:fill-violet-400" },
  ];
  const H = rows.length * ROW + 4;
  const maxDots = 20;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) => {
        const y = i * ROW + ROW / 2;
        const count = Math.ceil(r.value);
        const shown = Math.min(count, maxDots);
        const gap = (W - LABEL - 52) / maxDots;
        return (
          <g key={r.key}>
            <text x={LABEL - 8} y={y + 4} textAnchor="end" fontSize={12} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {t(r.key)}
            </text>
            {Array.from({ length: shown }, (_, k) => (
              <circle key={k} cx={LABEL + k * gap + gap / 2} cy={y} r={Math.min(6, gap / 2 - 1)} className={r.cls} />
            ))}
            <text x={W - 2} y={y + 4} textAnchor="end" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(r.value, 1)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <PasswordIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("coins"), value: f(s.entropyBits, 1) },
        { label: t("dice"), value: `${f(s.entropyBits, 1)} / ${f(Math.log2(6), 3)} = ${f(rows[1].value, 1)}` },
        { label: t("pins"), value: `${f(s.entropyBits, 1)} / ${f(Math.log2(10_000), 3)} = ${f(rows[2].value, 1)}` },
        { label: t("diceware"), value: `${f(s.entropyBits, 1)} / ${f(Math.log2(7776), 3)} = ${f(rows[3].value, 1)}` },
        { label: t("note"), value: t("dots", { n: maxDots }), emphasize: true },
      ]}
    />
  );
}
