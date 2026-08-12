"use client";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import { formatCrackTime, getStrengthTier, STRENGTH_TIER_ORDER, type StrengthTier } from "./crackTime";

const TIER_COLOR: Record<StrengthTier, string> = {
  veryWeak: "bg-red-500",
  weak: "bg-orange-500",
  reasonable: "bg-yellow-500",
  strong: "bg-emerald-500",
  veryStrong: "bg-blue-600",
};

const GUESS_RATES = [
  { key: "online", perSecond: 100 },
  { key: "offlineSlow", perSecond: 10_000 },
  { key: "offlineFast", perSecond: 100_000_000_000 },
] as const;

type PasswordResultProps = {
  password: string;
  entropyBits: number;
  onRegenerate: () => void;
};

export default function PasswordResult({ password, entropyBits, onRegenerate }: PasswordResultProps) {
  const t = useTranslations("tools.password-generator");
  const digitStyle: DigitStyle = "western";

  const tier = getStrengthTier(entropyBits);
  const tierIndex = STRENGTH_TIER_ORDER.indexOf(tier);

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <code dir="ltr" className="min-w-0 flex-1 break-all font-mono text-lg text-zinc-900 dark:text-zinc-100">
          {password}
        </code>
        <button
          type="button"
          onClick={onRegenerate}
          aria-label={t("form.regenerate")}
          className="flex shrink-0 items-center justify-center rounded-lg border border-zinc-300 p-2.5 text-zinc-600 transition hover:bg-white dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <RefreshCw size={16} />
        </button>
        <CopyButton text={password} className="shrink-0" />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("aboveFold.strengthLabel")}</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t(`aboveFold.tier.${tier}`)}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {STRENGTH_TIER_ORDER.map((step, i) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full ${i <= tierIndex ? TIER_COLOR[tier] : "bg-zinc-200 dark:bg-zinc-700"}`}
            />
          ))}
        </div>
        <p dir="ltr" className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          {formatLocalizedNumber(entropyBits, digitStyle, { maximumFractionDigits: 1 })} {t("aboveFold.bitsOfEntropy")}
        </p>
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t("aboveFold.crackTimeTitle")}
        </p>
        <div className="space-y-1.5">
          {GUESS_RATES.map(({ key, perSecond }) => {
            const combinations = Math.pow(2, entropyBits);
            const seconds = combinations / 2 / perSecond;
            const { magnitude, unit } = formatCrackTime(seconds);
            return (
              <div key={key} className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
                <span className="text-zinc-600 dark:text-zinc-300">{t(`aboveFold.rate.${key}`)}</span>
                <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {unit === "instant"
                    ? t("aboveFold.instantly")
                    : `${formatLocalizedNumber(magnitude, digitStyle, { maximumFractionDigits: magnitude < 10 ? 1 : 0 })} ${t(`aboveFold.unit.${unit}`)}`}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.crackTimeNote")}</p>
      </div>
    </SectionCard>
  );
}
