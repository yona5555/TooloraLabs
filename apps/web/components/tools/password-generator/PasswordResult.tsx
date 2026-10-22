"use client";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { GUESS_RATES } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import PasswordShareExportModal from "./PasswordShareExportModal";
import { formatCrackTime, getStrengthTier, STRENGTH_TIER_ORDER, type StrengthTier } from "./crackTime";
import { CLASS_TEXT, usePasswordLive, usePasswordModel } from "./PasswordLiveContext";

const TIER_COLOR: Record<StrengthTier, string> = {
  veryWeak: "bg-red-500",
  weak: "bg-orange-500",
  reasonable: "bg-yellow-500",
  strong: "bg-emerald-500",
  veryStrong: "bg-blue-600",
};

function classOf(ch: string): keyof typeof CLASS_TEXT {
  if (/[A-Z]/.test(ch)) return "uppercase";
  if (/[a-z]/.test(ch)) return "lowercase";
  if (/[0-9]/.test(ch)) return "numbers";
  if (/[!-/:-@[-`{-~]/.test(ch)) return "symbols";
  return "other";
}

/**
 * Result card: the password with every character coloured by class, the strength scale with its
 * entropy, and the expected crack time at three guess rates — all from the live settings.
 */
export default function PasswordResult({ onRegenerate }: { onRegenerate: () => void }) {
  const t = useTranslations("tools.password-generator");
  const tr = useTranslations("tools.password-generator.result");
  const { draft, s, classes, f } = usePasswordModel();
  const { setDim } = usePasswordLive();
  const password = draft.password;
  const tier = getStrengthTier(s.entropyBits);
  const tierIndex = STRENGTH_TIER_ORDER.indexOf(tier);

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        password ? (
          <PasswordShareExportModal
            operationLabel=""
            inputRows={[]}
            resultRows={[
              { label: t("aboveFold.strengthLabel"), value: t(`aboveFold.tier.${tier}`) },
              { label: t("aboveFold.bitsOfEntropy"), value: f(s.entropyBits, 1) },
            ]}
            heroLabel={t("shareExport.generatedPasswordLabel")}
            heroValue={password}
            sentence={t("shareExport.summarySentence", { tier: t(`aboveFold.tier.${tier}`), bits: f(s.entropyBits, 1) })}
          />
        ) : undefined
      }
    >
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <code dir="ltr" data-preview="visual" className="min-h-7 min-w-0 flex-1 font-mono text-lg font-semibold break-all">
          {[...password].map((ch, i) => (
            <span key={i} className={CLASS_TEXT[classOf(ch)]}>
              {ch}
            </span>
          ))}
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
      {classes && draft.mode === "characters" && (
        <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          {(["uppercase", "lowercase", "numbers", "symbols"] as const).map((c) => (
            <span key={c} className={`font-semibold ${CLASS_TEXT[c]}`}>
              {tr(`class.${c}`)} {classes[c]}
            </span>
          ))}
        </p>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("aboveFold.strengthLabel")}</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t(`aboveFold.tier.${tier}`)}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {STRENGTH_TIER_ORDER.map((step, i) => (
            <div key={step} className={`h-2 flex-1 rounded-full ${i <= tierIndex ? TIER_COLOR[tier] : "bg-zinc-200 dark:bg-zinc-700"}`} />
          ))}
        </div>
        <p dir="ltr" className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          {s.symbols} × log₂ {f(s.poolSize, 0)}
          {s.extraBits ? ` + log₂ 100` : ""} = {f(s.entropyBits, 1)} {t("aboveFold.bitsOfEntropy")}
        </p>
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{t("aboveFold.crackTimeTitle")}</p>
        <div className="flex flex-col gap-1.5">
          {GUESS_RATES.map(({ key }) => {
            const log10 = s.log10CrackSeconds[key];
            const { magnitude, unit } = formatCrackTime(10 ** log10);
            const share = Math.max(0.02, Math.min(1, (log10 + 2) / 30));
            return (
              <div key={key} className="rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-zinc-600 dark:text-zinc-300">{t(`aboveFold.rate.${key}`)}</span>
                  <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {unit === "instant" ? t("aboveFold.instantly") : `${f(magnitude, magnitude < 10 ? 1 : 0)} ${t(`aboveFold.unit.${unit}`)}`}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div className={`h-full rounded-full ${log10 > 9.5 ? "bg-emerald-500" : log10 > 5 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${share * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.crackTimeNote")}</p>
      </div>

      {draft.alternatives.length > 0 && (
        <div className="mt-5 flex flex-col border-t border-zinc-200 pt-4 lg:min-h-0 lg:flex-1 dark:border-zinc-800">
          <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{tr("alternatives")}</p>
          <ul className="flex flex-col gap-1.5 lg:flex-1 lg:justify-between">
            {draft.alternatives.map((alt, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg bg-zinc-50 px-2 py-1 dark:bg-zinc-800/50">
                <button
                  type="button"
                  onClick={() => setDim("password", alt)}
                  title={tr("use")}
                  dir="ltr"
                  className="min-w-0 flex-1 truncate text-start font-mono text-sm text-zinc-700 hover:text-blue-700 dark:text-zinc-200 dark:hover:text-blue-300"
                >
                  {alt}
                </button>
                <CopyButton text={alt} className="shrink-0 px-2 py-1 text-xs" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
