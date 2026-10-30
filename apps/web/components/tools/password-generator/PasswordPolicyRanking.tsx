"use client";
import { useTranslations } from "next-intl";
import { charEntropy, passphraseEntropy } from "@tooloralabs/tools";
import PasswordIndicatorCard, { PasswordIndicatorUnavailable } from "./PasswordIndicatorCard";
import { usePasswordModel } from "./PasswordLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 128;
const BAR_X = LABEL + 8;
const BAR_W = 150;
const ROW = 26;

/**
 * Type #5 (Ranked Horizontal Bar List): your settings ranked among common password recipes, each
 * scored with this tool's own pools (26 / 52 / 62 / 88 characters) and word list.
 */
export default function PasswordPolicyRanking() {
  const t = useTranslations("tools.password-generator.education.lab.policy");
  const { s, f } = usePasswordModel();
  if (!s.valid) return <PasswordIndicatorUnavailable title={t("title")} />;

  const recipes = [
    { key: "pin4", bits: charEntropy(4, 10) },
    { key: "lower8", bits: charEntropy(8, 26) },
    { key: "mixed8", bits: charEntropy(8, 62) },
    { key: "mixed12", bits: charEntropy(12, 62) },
    { key: "full16", bits: charEntropy(16, 88) },
    { key: "words4", bits: passphraseEntropy(4) },
    { key: "words6", bits: passphraseEntropy(6) },
    { key: "yours", bits: s.entropyBits },
  ].sort((a, b) => b.bits - a.bits);
  const peak = Math.max(...recipes.map((r) => r.bits));
  const H = recipes.length * ROW + 4;
  const rank = recipes.findIndex((r) => r.key === "yours") + 1;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {recipes.map((r, i) => {
        const y = i * ROW;
        const w = Math.max(3, Math.round((r.bits / peak) * BAR_W * 100) / 100);
        const me = r.key === "yours";
        return (
          <g key={r.key}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 17} textAnchor="end" fontWeight={me ? 700 : 500} className={me ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}>
              {t(r.key)}
            </text>
            <rect
              x={BAR_X}
              y={y + 5}
              width={w}
              height={ROW - 10}
              rx={3}
              className={me ? "fill-blue-600 dark:fill-blue-400" : r.bits >= 60 ? "fill-emerald-400 dark:fill-emerald-600" : "fill-zinc-300 dark:fill-zinc-600"}
            />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + w + 5} y={y + 17} fontWeight={me ? 700 : 500} fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
              {f(r.bits, 1)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const words6 = passphraseEntropy(6);
  return (
    <PasswordIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("rank"), value: `${rank} / ${recipes.length}` },
        { label: t("vsLower8"), value: `2^${f(s.entropyBits - charEntropy(8, 26), 1)} ×` },
        { label: t("vsWords6"), value: `${s.entropyBits >= words6 ? "+" : "−"}${f(Math.abs(s.entropyBits - words6), 1)} ${t("bits")}` },
        { label: t("wordList"), value: `${f(s.wordListSize)} → ${f(Math.log2(s.wordListSize), 2)} ${t("bits")}` },
        { label: t("yours"), value: `${f(s.entropyBits, 1)} ${t("bits")}`, emphasize: true },
      ]}
    />
  );
}
