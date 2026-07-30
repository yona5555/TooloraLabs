import { useTranslations } from "next-intl";
import type { SalesTaxResult as Result } from "./types";

type Props = {
  result: Result | null;
};

export default function SalesTaxResult({ result }: Props) {
  const t = useTranslations("tools.sales-tax-calculator.result");

  if (!result) return null;

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
      <div className="flex justify-between py-2">
        <span>{t("price")}</span>
        <strong>{result.price.toFixed(2)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("taxRate")}</span>
        <strong>{result.taxRate.toFixed(2)}%</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("taxAmount")}</span>
        <strong>{result.taxAmount.toFixed(2)}</strong>
      </div>

      <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
        <span>{t("totalPrice")}</span>
        <span>{result.totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
