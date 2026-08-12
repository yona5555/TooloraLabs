"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import DiscountPriceBar from "./DiscountPriceBar";
import type { DiscountResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function DiscountResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.discount-calculator");

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isStacked = result.mode === "apply" && result.discounts.length > 1;

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {result.mode === "apply" ? t("result.finalPrice") : t("result.originalPrice")}
      </p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {result.mode === "apply" ? money(result.finalPrice) : money(result.originalPrice)}
      </p>

      <div className="mt-5">
        <DiscountPriceBar
          originalPrice={result.originalPrice}
          finalPrice={result.finalPrice}
          finalLabel={t("result.finalPrice")}
          savedLabel={t("result.saved")}
          finalFormatted={money(result.finalPrice)}
          savedFormatted={money(result.saved)}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.originalPrice")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {money(result.originalPrice)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.saved")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {money(result.saved)}
          </dd>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60">
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          {isStacked ? t("result.effectiveDiscountLabel") : t("result.discountLabel")}
        </span>
        <span dir="ltr" className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {formatLocalizedNumber(result.effectiveDiscountPercent, digitStyle)}%
        </span>
      </div>
      {isStacked && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {t("result.stackedNote", { stages: result.discounts.map((d) => `${d}%`).join(" + ") })}
        </p>
      )}
    </SectionCard>
  );
}
