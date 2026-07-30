import { useTranslations } from "next-intl";
import type { TipResult as Result } from "./types";

type Props = {
  result: Result | null;
};

export default function TipResult({ result }: Props) {
  const t = useTranslations("tools.tip-calculator.result");

  if (!result) return null;

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
      <div className="flex justify-between py-2">
        <span>{t("billAmount")}</span>
        <strong>{result.billAmount.toFixed(2)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("tip")}</span>
        <strong>{result.tipPercent.toFixed(2)}%</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("people")}</span>
        <strong>{result.people}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("tipAmount")}</span>
        <strong>{result.tipAmount.toFixed(2)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("totalAmount")}</span>
        <strong>{result.totalAmount.toFixed(2)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>{t("tipPerPerson")}</span>
        <strong>{result.tipPerPerson.toFixed(2)}</strong>
      </div>

      <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
        <span>{t("totalPerPerson")}</span>
        <span>{result.totalPerPerson.toFixed(2)}</span>
      </div>
    </div>
  );
}
