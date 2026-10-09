import { getTranslations } from "next-intl/server";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertCurrencyAmount, findCurrencyByCode, type CurrencyRate } from "@tooloralabs/tools";
import InfoSection from "@/components/tool-ui/InfoSection";

type Props = { currencies: CurrencyRate[]; lastUpdatedUnix: number | null; locale: string };

/** Three conversions worked step by step from the same rate snapshot the converter uses. */
const EXAMPLES = [
  { from: "USD", to: "EUR", amount: 1000 },
  { from: "EUR", to: "JPY", amount: 250 },
  { from: "GBP", to: "SAR", amount: 500 },
];

export default async function ForexWorkedConversions({ currencies, lastUpdatedUnix, locale }: Props) {
  const t = await getTranslations("tools.forex-converter.workedExamples");
  const n = (v: number, max = 4) => formatLocalizedNumber(v, "western", { maximumFractionDigits: max });
  const when = lastUpdatedUnix ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(lastUpdatedUnix * 1000) : "";

  const examples = EXAMPLES.flatMap((e) => {
    const from = findCurrencyByCode(currencies, e.from);
    const to = findCurrencyByCode(currencies, e.to);
    return from && to ? [{ amount: e.amount, from, to }] : [];
  });
  if (examples.length === 0) return null;

  return (
    <InfoSection id="worked-examples" title={t("title")}>
      <p>{t("intro", { time: `${when} UTC` })}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {examples.map(({ from, to, amount }, i) => {
          const usd = amount / from.ratePerUsd;
          const result = convertCurrencyAmount(amount, from.ratePerUsd, to.ratePerUsd);
          return (
            <div key={i} className="rounded-xl border border-current/15 p-4 text-sm leading-6">
              <p className="font-semibold">
                {t("exampleTitle", { n: i + 1 })}:{" "}
                <span dir="ltr">
                  {n(amount)} {from.code} → {to.code}
                </span>
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 ps-5">
                <li>
                  {t("step1", { from: from.code })}{" "}
                  <span dir="ltr" className="font-mono">
                    1 USD = {n(from.ratePerUsd)} {from.code}
                  </span>
                </li>
                <li>
                  {t("step2")}{" "}
                  <span dir="ltr" className="font-mono">
                    {n(amount)} ÷ {n(from.ratePerUsd)} = {n(usd)} USD
                  </span>
                </li>
                <li>
                  {t("step3", { to: to.code })}{" "}
                  <span dir="ltr" className="font-mono">
                    {n(usd)} × {n(to.ratePerUsd)} = {n(result, 2)} {to.code}
                  </span>
                </li>
                <li>
                  {t("step4")}{" "}
                  <span dir="ltr" className="font-mono">
                    1 {from.code} = {n(to.ratePerUsd / from.ratePerUsd)} {to.code}
                  </span>
                </li>
              </ol>
              <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 font-mono font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" dir="ltr">
                {n(amount)} {from.code} = {n(result, 2)} {to.code}
              </p>
            </div>
          );
        })}
      </div>
    </InfoSection>
  );
}
