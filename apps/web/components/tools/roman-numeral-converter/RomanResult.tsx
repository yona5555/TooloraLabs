import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { RomanNumeralOutput, RomanConversionDirection } from "./types";

type Props = {
  result: RomanNumeralOutput;
  direction: RomanConversionDirection;
  digitStyle: DigitStyle;
};

export default function RomanResult({ result, direction, digitStyle }: Props) {
  const t = useTranslations("tools.roman-numeral-converter.result");

  if (result.error || result.romanValue === null || result.arabicValue === null) {
    const messageKey =
      result.error === "empty-input"
        ? "emptyInput"
        : result.error === "out-of-range"
          ? "outOfRange"
          : "invalidRoman";
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

  const formattedArabic = formatLocalizedNumber(result.arabicValue, digitStyle);
  const isToRoman = direction === "toRoman";

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={isToRoman ? result.romanValue : formattedArabic} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
        <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-300">
          {isToRoman ? result.romanValue : formattedArabic}
        </p>
        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {isToRoman ? `${formattedArabic} = ${result.romanValue}` : `${result.romanValue} = ${formattedArabic}`}
        </p>
      </div>
    </div>
  );
}
