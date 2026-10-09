"use client";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import type { CryptoCoin } from "@tooloralabs/tools";
import { useLiveTicks } from "./useCryptoLive";
import { cryptoFormatters, changeColor } from "./cryptoFormat";

type Props = { coins: CryptoCoin[]; digitStyle: DigitStyle; onPick: (id: string) => void };

const COUNT = 24;

/** Right-column live price board for the top coins: Coinbase ticks where listed, snapshot prices otherwise. */
export default function CryptoSidebarTicker({ coins, digitStyle, onPick }: Props) {
  const t = useTranslations("tools.crypto-converter.ticker");
  const top = coins.slice(0, COUNT);
  const ticks = useLiveTicks(top.map((c) => c.symbol));
  const f = cryptoFormatters(digitStyle);

  return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900">
        <div className="flex items-center justify-between rounded-t-2xl bg-blue-600 px-4 py-2.5">
          <h2 className="font-bold text-white">{t("title")}</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            {t("live")}
          </span>
        </div>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800" data-testid="sidebar-ticker">
          {top.map((c) => {
            const tick = ticks[c.symbol.toUpperCase()];
            const price = tick?.price ?? c.currentPrice;
            const flash = tick?.direction === "up" ? "animate-flash-up" : tick?.direction === "down" ? "animate-flash-down" : "";
            return (
              <li key={c.id}>
                <button type="button" onClick={() => onPick(c.id)} className="flex w-full items-center gap-2 px-4 py-2 text-start hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                  <span className="w-5 text-[10px] text-zinc-400">{c.marketCapRank}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" width={18} height={18} className="rounded-full" />
                  <span dir="ltr" className="font-mono text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-100">{c.symbol}</span>
                  <span key={tick?.at ?? 0} dir="ltr" className={`ms-auto rounded px-1 font-mono text-xs text-zinc-900 dark:text-zinc-100 ${flash}`}>{f.usd(price)}</span>
                  <span dir="ltr" className={`w-14 text-end font-mono text-[11px] ${changeColor(c.priceChangePercentage24h)}`}>
                    {c.priceChangePercentage24h == null ? "—" : f.signedPct(c.priceChangePercentage24h, 1)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="px-4 py-2 text-[11px] text-zinc-400 dark:text-zinc-500">{t("note")}</p>
      </div>
  );
}
