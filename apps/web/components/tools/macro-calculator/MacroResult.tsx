import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { MacroResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import MacroPieChart from "./MacroPieChart";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function MacroResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.macro-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  if (result.error) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidCalories")}</p>
        </div>
      </div>
    );
  }

  const rows: { key: "protein" | "carbs" | "fat"; color: string }[] = [
    { key: "protein", color: "border-blue-400 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" },
    { key: "carbs", color: "border-emerald-400 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10" },
    { key: "fat", color: "border-amber-400 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10" },
  ];

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={rows.map((r) => `${t(r.key)}: ${fmt(result[r.key].grams)}g (${fmt(result[r.key].calories)} kcal)`).join(", ")}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <MacroPieChart protein={result.protein} carbs={result.carbs} fat={result.fat} />

        <div className="mt-5 space-y-2.5">
          {rows.map((row) => (
            <div key={row.key} className={`flex items-center justify-between rounded-xl border p-3 ${row.color}`}>
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {t(row.key)} <span className="font-normal text-zinc-500 dark:text-zinc-400">({fmt(result[row.key].percent)}%)</span>
              </span>
              <span className="text-right">
                <span className="block text-base font-bold text-zinc-800 dark:text-zinc-100">{fmt(result[row.key].grams)} g</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">{fmt(result[row.key].calories)} kcal</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
