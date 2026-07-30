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
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
      <div className="flex justify-between py-2">
        <span>{t("billAmount")}</span>
        <strong>{money(result.billAmount)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("tip")}</span>
        <strong>{money(result.tipPercent)}%</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("people")}</span>
        <strong>{formatLocalizedNumber(result.people, digitStyle)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("tipAmount")}</span>
        <strong>{money(result.tipAmount)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("totalAmount")}</span>
        <strong>{money(result.totalAmount)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("tipPerPerson")}</span>
        <strong>{money(result.tipPerPerson)}</strong>
      </div>

      <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
        <span>{t("totalPerPerson")}</span>
        <span>{money(result.totalPerPerson)}</span>
      </div>
    </div>
  );
}
