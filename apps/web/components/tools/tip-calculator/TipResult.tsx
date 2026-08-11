"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import TipBreakdownDonut from "./TipBreakdownDonut";
import type { TipResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function TipResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.tip-calculator");

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("result.totalPerPerson")}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {money(result.totalPerPerson)}
      </p>
      {result.roundedUp && (
        <p className="mt-1 text-center text-xs text-blue-600 dark:text-blue-400">{t("aboveFold.roundedUpNote")}</p>
      )}

      <div className="mt-5">
        <TipBreakdownDonut
          centerValue={money(result.totalAmount)}
          centerLabel={t("result.totalAmount")}
          segments={[
            { key: "bill", value: result.billAmount, label: t("result.billAmount"), colorClass: "stroke-zinc-400 dark:stroke-zinc-600" },
            { key: "tip", value: result.tipAmount, label: t("result.tipAmount"), colorClass: "stroke-blue-600 dark:stroke-blue-400" },
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-5 text-center dark:border-zinc-800">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.tipPerPerson")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {money(result.tipPerPerson)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("result.people")}</dt>
          <dd dir="ltr" className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatLocalizedNumber(result.people, digitStyle)}
          </dd>
        </div>
      </div>
    </SectionCard>
  );
}
