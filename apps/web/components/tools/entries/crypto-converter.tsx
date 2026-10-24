import CryptoConverter from "@/components/tools/crypto-converter/CryptoConverter";
import CryptoEducation from "@/components/tools/crypto-converter/CryptoEducation";
import { getFetchTimestamp, getFiatRates, getGlobalStats, getTopCoins } from "@/lib/crypto/coingecko";
import { getCandles } from "@/lib/crypto/candles";
import type { ToolEntryProps } from "./types";

export default async function ToolEntry({ locale }: ToolEntryProps) {
  const now = Math.floor(getFetchTimestamp() / 1000);
  // Phone pilot ticker trends: the converter chart's own daily candles; a failed fetch only hides the line.
  const closes = (symbol: string) =>
    getCandles(symbol, "1D", now).then(
      (r) => r?.candles.map((c) => c.close).slice(-30),
      () => undefined
    );
  const [initialCoins, globalStats, fiatRates, btcTrend, ethTrend] = await Promise.all([
    getTopCoins(100),
    getGlobalStats(),
    getFiatRates(),
    closes("btc"),
    closes("eth"),
  ]);
  const fetchedAt = getFetchTimestamp();
  return (
    <CryptoConverter
      initialCoins={initialCoins}
      globalStats={globalStats}
      fiatRates={fiatRates}
      fetchedAt={fetchedAt}
      phoneTrends={{ bitcoin: btcTrend, ethereum: ethTrend }}
      education={<CryptoEducation coins={initialCoins} fetchedAt={fetchedAt} locale={locale} />}
    />
  );
}
