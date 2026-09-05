import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { BatchInvoiceCalculatorOutput } from "./types";

type Props = {
  result: BatchInvoiceCalculatorOutput;
  digitStyle: DigitStyle;
};

export default function DraftPreview({ result, digitStyle }: Props) {
  const t = useTranslations("tools.batch-invoice-calculator.draftPreview");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const message =
    result.error === "no-line-items"
      ? t("noLineItems")
      : result.error === "invalid-line-item"
        ? t("invalidLineItem")
        : result.error === "invalid-tax"
          ? t("invalidTax")
          : null;

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
      </div>
      <div className="p-4 lg:p-6">
        {message ? (
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span className="text-zinc-500 dark:text-zinc-400">{t("subtotalLabel")}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.subtotal)}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-zinc-500 dark:text-zinc-400">{t("taxLabel")}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.taxAmount)}</span>
            </li>
            <li className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-1.5 dark:border-zinc-800">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t("totalLabel")}</span>
              <span className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{fmt(result.total)}</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
