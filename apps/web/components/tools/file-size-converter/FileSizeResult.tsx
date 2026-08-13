"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { FileSizeConverterOutput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

type FileSizeResultProps = {
  data: FileSizeConverterOutput | null;
  errorMessage: string;
  digitStyle: DigitStyle;
};

function UnitTable({ title, rows, digitStyle }: { title: string; rows: { unit: string; value: number }[]; digitStyle: DigitStyle }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</p>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.unit} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-1.5 text-sm dark:bg-zinc-800/60">
            <span dir="ltr" className="font-mono text-zinc-500 dark:text-zinc-400">{row.unit}</span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {formatLocalizedNumber(row.value, digitStyle, { maximumFractionDigits: row.value < 1 ? 6 : 3 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FileSizeResult({ data, errorMessage, digitStyle }: FileSizeResultProps) {
  const t = useTranslations("tools.file-size-converter");

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </p>
      ) : data ? (
        <>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.exactBytes")}</p>
          <p dir="ltr" className="text-center font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">
            {formatLocalizedNumber(data.bytes, digitStyle, { maximumFractionDigits: 0 })}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <UnitTable title={t("aboveFold.decimalTitle")} rows={data.decimal} digitStyle={digitStyle} />
            <UnitTable title={t("aboveFold.binaryTitle")} rows={data.binary} digitStyle={digitStyle} />
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
