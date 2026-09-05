import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { GcfLcmDraft, GcfLcmResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
  draft: GcfLcmDraft;
};

function factorizationToString(factors: { prime: number; exponent: number }[]): string {
  if (factors.length === 0) return "";
  return factors.map((f) => (f.exponent === 1 ? `${f.prime}` : `${f.prime}^${f.exponent}`)).join(" × ");
}

export default function GcfLcmResult({ result, digitStyle, draft }: Props) {
  const t = useTranslations("tools.gcf-lcm-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  if (result.error) {
    const messageKey = result.error === "too-few-numbers" ? "tooFewNumbers" : "invalidNumber";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={`${t("gcfLabel")}: ${fmt(result.gcf)}, ${t("lcmLabel")}: ${fmt(result.lcm)}`} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.gcf)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("gcfLabel")}</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.lcm)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("lcmLabel")}</p>
          </div>
        </div>

        <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("factorizationsTitle")}</p>
          <ul dir="ltr" className="space-y-1.5 text-sm">
            {result.factorizations.map((factors, i) => (
              <li key={i} className="flex items-center justify-between gap-3 font-mono text-zinc-700 dark:text-zinc-200">
                <span>{draft.numbers[i]}</span>
                <span className="text-zinc-500 dark:text-zinc-400">= {factorizationToString(factors)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
