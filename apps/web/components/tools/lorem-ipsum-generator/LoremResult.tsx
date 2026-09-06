import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { LoremIpsumOutput } from "./types";

type Props = {
  result: LoremIpsumOutput;
  digitStyle: DigitStyle;
};

export default function LoremResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.lorem-ipsum-generator.result");

  if (result.error) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("invalidCount")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={result.text} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
        <div
          dir="ltr"
          className="max-h-96 overflow-y-auto whitespace-pre-line rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm leading-7 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-100"
        >
          {result.text}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <span className="text-zinc-500 dark:text-zinc-400">{t("wordCountLabel")}</span>
          <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{formatLocalizedNumber(result.wordCount, digitStyle)}</span>
        </div>
      </div>
    </div>
  );
}
