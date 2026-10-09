import { getTranslations } from "next-intl/server";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertCryptoAmount, findCoinById, type CryptoCoin } from "@tooloralabs/tools";
import InfoSection from "@/components/tool-ui/InfoSection";

type Props = { coins: CryptoCoin[]; fetchedAt: number; locale: string };

/** Three conversions worked step by step from the same price snapshot the page loaded. */
const EXAMPLES = [
  { from: "bitcoin", to: "ethereum", amount: 0.5 },
  { from: "tether", to: "solana", amount: 1000 },
  { from: "ethereum", to: "binancecoin", amount: 2 },
];

export default async function CryptoWorkedConversions({ coins, fetchedAt, locale }: Props) {
  const t = await getTranslations("tools.crypto-converter.workedExamples");
  const usd = (v: number) => formatLocalizedNumber(v, "western", { style: "currency", currency: "USD", maximumFractionDigits: v < 1 ? 6 : 2 });
  const n = (v: number) => formatLocalizedNumber(v, "western", { maximumFractionDigits: v < 1 ? 8 : 4 });
  const when = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(fetchedAt);

  const examples = EXAMPLES.flatMap((e) => {
    const from = findCoinById(coins, e.from);
    const to = findCoinById(coins, e.to);
    return from && to ? [{ ...e, from, to }] : [];
  });
  if (examples.length === 0) return null;

  return (
    <InfoSection title={t("title")}>
      <p>{t("intro", { time: `${when} UTC` })}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {examples.map(({ from, to, amount }, i) => {
          const value = amount * from.currentPrice;
          const result = convertCryptoAmount(amount, from.currentPrice, to.currentPrice);
          const F = from.symbol.toUpperCase();
          const T = to.symbol.toUpperCase();
          return (
            <div key={i} className="rounded-xl border border-current/15 p-4 text-sm leading-6">
              <p className="font-semibold">
                {t("exampleTitle", { n: i + 1 })}: <span dir="ltr">{n(amount)} {F} → {T}</span>
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 ps-5">
                <li>
                  {t("step1", { from: F })} <span dir="ltr" className="font-mono">{n(amount)} × {usd(from.currentPrice)} = {usd(value)}</span>
                </li>
                <li>
                  {t("step2", { to: T })} <span dir="ltr" className="font-mono">{usd(value)} ÷ {usd(to.currentPrice)} = {n(result)}</span>
                </li>
                <li>
                  {t("step3")} <span dir="ltr" className="font-mono">1 {F} = {n(from.currentPrice / to.currentPrice)} {T}</span>
                </li>
              </ol>
              <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 font-mono font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" dir="ltr">
                {n(amount)} {F} = {n(result)} {T}
              </p>
            </div>
          );
        })}
      </div>
    </InfoSection>
  );
}
