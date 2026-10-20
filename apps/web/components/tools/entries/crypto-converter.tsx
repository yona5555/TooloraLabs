import CryptoConverter from "@/components/tools/crypto-converter/CryptoConverter";
import CryptoEducation from "@/components/tools/crypto-converter/CryptoEducation";
import { getFetchTimestamp, getFiatRates, getGlobalStats, getTopCoins } from "@/lib/crypto/coingecko";
import type { ToolEntryProps } from "./types";

export default async function ToolEntry({ locale }: ToolEntryProps) {
  const [initialCoins, globalStats, fiatRates] = await Promise.all([
    getTopCoins(100),
    getGlobalStats(),
    getFiatRates(),
  ]);
  const fetchedAt = getFetchTimestamp();
  return (
    <CryptoConverter
      initialCoins={initialCoins}
      globalStats={globalStats}
      fiatRates={fiatRates}
      fetchedAt={fetchedAt}
      education={<CryptoEducation coins={initialCoins} fetchedAt={fetchedAt} locale={locale} />}
    />
  );
}
