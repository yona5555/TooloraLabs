import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CryptoGlobalStats } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

type CryptoGlobalIndicatorsProps = {
  stats: CryptoGlobalStats;
  digitStyle: DigitStyle;
};

export default function CryptoGlobalIndicators({ stats, digitStyle }: CryptoGlobalIndicatorsProps) {
  const t = useTranslations("tools.crypto-converter.indicators");

  const compactUsd = (value: number) =>
    formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency: "USD",
      notation: "compact",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <SectionCard id="indicators" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("totalMarketCapLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {compactUsd(stats.totalMarketCapUsd)}
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("btcDominanceLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatLocalizedNumber(stats.btcDominancePercentage, digitStyle, { maximumFractionDigits: 1 })}%
          </dd>
        </div>
        <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("activeCoinsLabel")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatLocalizedNumber(stats.activeCryptocurrencies, digitStyle, { maximumFractionDigits: 0 })}
          </dd>
        </div>
      </dl>
    </SectionCard>
  );
}
