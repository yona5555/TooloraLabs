"use client";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { convertCurrencyAmount, findCurrencyByCode, type CurrencyRate } from "@tooloralabs/tools";
import IndicatorCard from "@/components/tools/markets/IndicatorCard";
import { useMarketFormatters } from "@/components/tools/markets/fiat";
import { useCurrencyName } from "./useForexData";

type Props = { currencies: CurrencyRate[]; fromCurrency: CurrencyRate | undefined; amount: number; digitStyle: DigitStyle };

const MAJORS = ["USD", "EUR", "GBP", "JPY", "CHF", "CNY", "SAR", "AED", "CAD"];

/** Side-by-side equivalence (§31 type 11): the same amount, expressed in the most-used currencies at once. */
export default function ForexEquivalence({ currencies, fromCurrency, amount, digitStyle }: Props) {
  const t = useTranslations("tools.forex-converter.equivalence");
  const f = useMarketFormatters(digitStyle);
  const name = useCurrencyName();
  if (!fromCurrency) return null;
  const amt = Number.isFinite(amount) ? amount : 0;
  const targets = MAJORS.filter((c) => c !== fromCurrency.code)
    .slice(0, 8)
    .flatMap((code) => {
      const c = findCurrencyByCode(currencies, code);
      return c ? [{ c, value: convertCurrencyAmount(amt, fromCurrency.ratePerUsd, c.ratePerUsd) }] : [];
    });
  if (targets.length === 0) return null;
  const F = fromCurrency.code;
  const ex = targets[1] ?? targets[0];

  return (
    <IndicatorCard
      id="equivalence"
      title={t("title")}
      heading={t("heading", { amount: f.num(amt, 2), code: F })}
      intro={t("intro")}
      worked={{
        title: t("workedTitle"),
        rows: [
          { label: t("rowAmount"), value: `${f.num(amt, 2)} ${F}` },
          { label: t("rowToUsd", { code: F }), value: `÷ ${f.rate(fromCurrency.ratePerUsd)} = ${f.num(amt / fromCurrency.ratePerUsd, 4)} USD` },
          { label: t("rowToTarget", { code: ex.c.code }), value: `× ${f.rate(ex.c.ratePerUsd)}` },
          { label: t("rowResult"), value: `${f.num(ex.value, 2)} ${ex.c.code}`, emphasize: true },
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-2" data-testid="equivalence-grid">
        {targets.map(({ c, value }) => (
          <div key={c.code} className="min-w-0 rounded-xl border border-zinc-200 p-2.5 dark:border-zinc-700">
            <div className="flex items-center gap-1.5">
              <span dir="ltr" className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {c.code}
              </span>
              <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">{name(c.code, c.name)}</span>
            </div>
            <p dir="ltr" className="mt-1 truncate font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
              = {f.num(value, value !== 0 && Math.abs(value) < 1 ? 4 : 2)}
            </p>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}
