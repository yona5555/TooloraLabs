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
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
      <div className="flex justify-between py-2">
        <span>{t("price")}</span>
        <strong>{money(result.price)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("taxRate")}</span>
        <strong>{money(result.taxRate)}%</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("taxAmount")}</span>
        <strong>{money(result.taxAmount)}</strong>
      </div>

      <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
        <span>{t("totalPrice")}</span>
        <span>{money(result.totalPrice)}</span>
      </div>
    </div>
  );
}
