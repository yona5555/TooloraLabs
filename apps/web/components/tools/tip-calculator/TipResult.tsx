import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { TipResult as Result } from "./types";

type Props = {
  result: Result | null;
  digitStyle: DigitStyle;
};

export default function TipResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.tip-calculator.result");

  if (!result) return null;

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex justify-between py-2 text-zinc-600 dark:text-zinc-300">
        <span>{t("billAmount")}</span>
        <strong className="text-zinc-900 dark:text-zinc-50">{money(result.billAmount)}</strong>
      </div>

      <div className="flex justify-between py-2 text-zinc-600 dark:text-zinc-300">
        <span>{t("tip")}</span>
        <strong className="text-zinc-900 dark:text-zinc-50">{money(result.tipPercent)}%</strong>
      </div>

      <div className="flex justify-between py-2 text-zinc-600 dark:text-zinc-300">
        <span>{t("people")}</span>
        <strong className="text-zinc-900 dark:text-zinc-50">{formatLocalizedNumber(result.people, digitStyle)}</strong>
      </div>

      <div className="flex justify-between py-2 text-zinc-600 dark:text-zinc-300">
        <span>{t("tipAmount")}</span>
        <strong className="text-zinc-900 dark:text-zinc-50">{money(result.tipAmount)}</strong>
      </div>

      <div className="flex justify-between py-2 text-zinc-600 dark:text-zinc-300">
        <span>{t("totalAmount")}</span>
        <strong className="text-zinc-900 dark:text-zinc-50">{money(result.totalAmount)}</strong>
      </div>

      <div className="flex justify-between py-2 text-zinc-600 dark:text-zinc-300">
        <span>{t("tipPerPerson")}</span>
        <strong className="text-zinc-900 dark:text-zinc-50">{money(result.tipPerPerson)}</strong>
      </div>

      <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-lg font-bold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
        <span>{t("totalPerPerson")}</span>
        <span>{money(result.totalPerPerson)}</span>
      </div>
    </div>
  );
}
