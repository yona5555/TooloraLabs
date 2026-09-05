import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { RandomNumberGeneratorOutput } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";

type Props = {
  result: RandomNumberGeneratorOutput;
  digitStyle: DigitStyle;
};

export default function RandomNumberResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.random-number-generator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  if (result.error) {
    const messageKey = result.error === "invalid-range" ? "invalidRange" : result.error === "invalid-count" ? "invalidCount" : "rangeTooSmall";
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
        <CopyButton text={result.numbers.join(", ")} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
        <div dir="ltr" className="flex max-h-64 flex-wrap gap-2 overflow-y-auto rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
          {result.numbers.map((n, i) => (
            <span
              key={i}
              className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-blue-50 px-2.5 py-1.5 font-mono text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
            >
              {fmt(n)}
            </span>
          ))}
        </div>

        <ul className="mt-5 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("countLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.numbers.length)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("sumLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.sum)}</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">{t("averageLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.average)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
