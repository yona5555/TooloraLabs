"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";

type Base64ResultProps = {
  result: string;
  errorMessage: string;
  inputBytes: number;
  outputBytes: number;
  digitStyle: DigitStyle;
};

export default function Base64Result({ result, errorMessage, inputBytes, outputBytes, digitStyle }: Base64ResultProps) {
  const t = useTranslations("tools.base64-tool");

  const maxBytes = Math.max(inputBytes, outputBytes, 1);
  const overheadPercent = inputBytes > 0 ? Math.round(((outputBytes - inputBytes) / inputBytes) * 100) : 0;

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={result ? <CopyButton text={result} /> : undefined}
    >
      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </p>
      ) : result ? (
        <>
          <textarea
            readOnly
            value={result}
            rows={10}
            dir="ltr"
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{t("aboveFold.sizeInput")}</span>
              <span dir="ltr" className="font-mono">{formatLocalizedNumber(inputBytes, digitStyle)} {t("aboveFold.bytes")}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500" style={{ width: `${(inputBytes / maxBytes) * 100}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{t("aboveFold.sizeOutput")}</span>
              <span dir="ltr" className="font-mono">{formatLocalizedNumber(outputBytes, digitStyle)} {t("aboveFold.bytes")}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${(outputBytes / maxBytes) * 100}%` }} />
            </div>

            {inputBytes > 0 && (
              <p dir="ltr" className="pt-1 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {overheadPercent >= 0 ? "+" : ""}
                {formatLocalizedNumber(overheadPercent, digitStyle)}% {t("aboveFold.sizeChange")}
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
