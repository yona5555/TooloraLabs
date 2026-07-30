import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { SalesTaxResult as Result } from "./types";

type Props = {
  result: Result | null;
  digitStyle: DigitStyle;
};

export default function SalesTaxResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.sales-tax-calculator.result");

  if (!result) return null;

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex justify-between py-2 text-zinc-600 dark:text-zinc-300">
        <span>{t("price")}</span>
        <strong className="text-zinc-900 dark:text-zinc-50">{money(result.price)}</strong>
      </div>

      <div className="flex justify-between py-2 text-zinc-600 dark:text-zinc-300">
        <span>{t("taxRate")}</span>
        <strong className="text-zinc-900 dark:text-zinc-50">{money(result.taxRate)}%</strong>
      </div>

      <div className="flex justify-between py-2 text-zinc-600 dark:text-zinc-300">
        <span>{t("taxAmount")}</span>
        <strong className="text-zinc-900 dark:text-zinc-50">{money(result.taxAmount)}</strong>
      </div>

      <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-lg font-bold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
        <span>{t("totalPrice")}</span>
        <span>{money(result.totalPrice)}</span>
      </div>
    </div>
  );
}
