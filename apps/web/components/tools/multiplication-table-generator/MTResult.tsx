"use client";
import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { MultiplicationTableOutput } from "./types";

type Props = {
  result: MultiplicationTableOutput;
  digitStyle: DigitStyle;
};

export default function MTResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.multiplication-table-generator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle);

  if (result.error) {
    const messageKey =
      result.error === "invalid-number"
        ? "invalidNumber"
        : result.error === "invalid-multiplier"
          ? "invalidMultiplier"
          : result.error === "range-too-large"
            ? "rangeTooLarge"
            : "invalidRange";
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
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          <Printer size={14} />
          {t("print")}
        </button>
      </div>
      <div className="p-4 lg:p-6">
        <div dir="ltr" data-print-area className="max-h-[28rem] overflow-auto">
          {result.singleRows ? (
            <table className="w-full min-w-[220px] border-collapse text-center text-sm">
              <tbody>
                {result.singleRows.map((row) => (
                  <tr key={row.multiplier} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-3 py-2 font-mono text-zinc-500 dark:text-zinc-400">
                      {fmt(row.multiplier)} ×
                    </td>
                    <td className="px-3 py-2 font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                      = {fmt(row.result)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : result.grid ? (
            <table className="w-full min-w-[420px] border-collapse text-center text-sm">
              <thead>
                <tr>
                  <th className="border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">×</th>
                  {result.grid.headers.map((h) => (
                    <th key={h} className="border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-800">
                      {fmt(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.grid.rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <th className="border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-800">
                      {fmt(row.rowNumber)}
                    </th>
                    {row.cells.map((cell, i) => (
                      <td key={i} className="border border-zinc-100 px-2 py-1.5 font-mono text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
                        {fmt(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </div>
  );
}
