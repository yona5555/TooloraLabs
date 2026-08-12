"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import SalesTaxBreakdownBar from "./SalesTaxBreakdownBar";
import type { SalesTaxResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function SalesTaxResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.sales-tax-calculator");

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {result.mode === "add" ? t("result.totalPrice") : t("result.price")}
      </p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {result.mode === "add" ? money(result.totalPrice) : money(result.price)}
      </p>

      <div className="mt-5">
        <SalesTaxBreakdownBar
          price={result.price}
          taxAmount={result.taxAmount}
          priceLabel={t("result.price")}
          taxLabel={t("result.taxAmount")}
          priceFormatted={money(result.price)}
          taxFormatted={money(result.taxAmount)}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.price")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {money(result.price)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.totalPrice")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {money(result.totalPrice)}
          </dd>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
        <span className="text-sm text-zinc-600 dark:text-zinc-300">{t("result.taxAmount")}</span>
        <span dir="ltr" className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
          {money(result.taxAmount)}
        </span>
      </div>
      {result.mode === "reverse" && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {t("result.reverseNote", { rate: formatLocalizedNumber(result.taxRate, digitStyle) })}
        </p>
      )}
    </SectionCard>
  );
}
