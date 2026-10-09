"use client";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { topMovers, type CryptoCoin } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { cryptoFormatters } from "./cryptoFormat";

type Props = { coins: CryptoCoin[]; digitStyle: DigitStyle; onPick: (id: string) => void };

export default function CryptoTopMovers({ coins, digitStyle, onPick }: Props) {
  const t = useTranslations("tools.crypto-converter.movers");
  const f = cryptoFormatters(digitStyle);
  const { gainers, losers } = topMovers(coins, 5);
  const maxAbs = Math.max(...[...gainers, ...losers].map((c) => Math.abs(c.priceChangePercentage24h ?? 0)), 1);
  const best = gainers[0];
  const prevPrice = best ? best.currentPrice / (1 + (best.priceChangePercentage24h ?? 0) / 100) : 0;

  const list = (items: CryptoCoin[], up: boolean) => (
    <ul className="space-y-1.5">
      {items.map((c) => {
        const v = c.priceChangePercentage24h ?? 0;
        return (
          <li key={c.id}>
            <button type="button" onClick={() => onPick(c.id)} title={t("pick")} className="grid w-full grid-cols-[4.5rem_minmax(0,1fr)_4rem] items-center gap-2 rounded-md px-1 py-0.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
              <span className="flex items-center gap-1.5 truncate">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt="" width={14} height={14} className="rounded-full" />
                <span dir="ltr" className="font-mono uppercase text-zinc-700 dark:text-zinc-200">{c.symbol}</span>
              </span>
              <span className="h-3 rounded-sm bg-zinc-100 dark:bg-zinc-800">
                <span className={`block h-full rounded-sm ${up ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${(Math.abs(v) / maxAbs) * 100}%` }} />
              </span>
              <span dir="ltr" className={`text-end font-mono font-semibold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{f.signedPct(v, 1)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <SectionCard id="movers" title={t("title")}>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t("heading")}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { count: coins.length })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2" data-testid="top-movers">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">▲ {t("gainers")}</p>
            {gainers.length ? list(gainers, true) : <p className="text-xs text-zinc-400">{t("none")}</p>}
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-red-700 dark:text-red-400">▼ {t("losers")}</p>
            {losers.length ? list(losers, false) : <p className="text-xs text-zinc-400">{t("none")}</p>}
          </div>
        </div>
        {best && (
          <div className="lg:w-64">
            <WorkedExampleNote
              title={t("workedTitle", { coin: best.name })}
              rows={[
                { label: t("rowNow"), value: f.usd(best.currentPrice) },
                { label: t("rowChange"), value: f.signedPct(best.priceChangePercentage24h ?? 0) },
                { label: t("rowThen"), value: f.usd(prevPrice), emphasize: true, note: t("rowThenNote") },
              ]}
            />
          </div>
        )}
      </div>
    </SectionCard>
  );
}
