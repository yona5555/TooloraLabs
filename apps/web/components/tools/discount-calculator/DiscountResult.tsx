import { useTranslations } from "next-intl";
import type { DiscountResult } from "./types";

type Props = {
  result: DiscountResult | null;
};

export default function Result({ result }: Props) {
  const t = useTranslations("tools.discount-calculator.result");

  if (!result) return null;

  return (
    <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">
        {t("heading")}
      </h3>

      <div className="mt-6 space-y-3 text-lg">
        <div className="flex justify-between">
          <span>{t("originalPrice")}</span>
          <strong>{result.originalPrice}</strong>
        </div>

        <div className="flex justify-between">
          <span>{t("discount")}</span>
          <strong>{result.discountPercent}%</strong>
        </div>

        <div className="flex justify-between">
          <span>{t("saved")}</span>
          <strong>{result.saved}</strong>
        </div>

        <div className="flex justify-between">
          <span>{t("finalPrice")}</span>
          <strong className="text-2xl text-blue-600">
            {result.finalPrice}
          </strong>
        </div>
      </div>
    </div>
  );
}
