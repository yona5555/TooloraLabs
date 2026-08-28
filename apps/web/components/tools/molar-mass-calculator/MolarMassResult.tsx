import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { MolarMassResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function MolarMassResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.molar-mass-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });
  const fmtInt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  if (result.error) {
    const messageKey =
      result.error === "empty-formula"
        ? "emptyFormula"
        : result.error === "unknown-element"
          ? "unknownElement"
          : result.error === "unbalanced-parentheses"
            ? "unbalancedParentheses"
            : "invalidFormula";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
          {result.errorDetail && <p dir="ltr" className="mt-2 text-center font-mono text-xs text-zinc-400">{result.errorDetail}</p>}
        </div>
      </div>
    );
  }

  const copyText = `${t("totalMass")}: ${fmt(result.totalMass)} g/mol`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(result.totalMass)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">g/mol</span>
          </p>
          <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("totalMass")}</p>

          <div dir="ltr" className="mt-4 overflow-x-auto border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <table className="w-full min-w-[320px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-start dark:border-zinc-700">
                  <th className="px-2 py-1.5 text-start font-semibold">{t("columnElement")}</th>
                  <th className="px-2 py-1.5 text-start font-semibold">{t("columnCount")}</th>
                  <th className="px-2 py-1.5 text-start font-semibold">{t("columnAtomicMass")}</th>
                  <th className="px-2 py-1.5 text-start font-semibold">{t("columnSubtotal")}</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.symbol} className="border-b border-zinc-100 dark:border-zinc-800/60">
                    <td className="px-2 py-1.5 font-mono font-semibold">{row.symbol}</td>
                    <td className="px-2 py-1.5 font-mono">{fmtInt(row.count)}</td>
                    <td className="px-2 py-1.5 font-mono">{fmt(row.atomicMass)}</td>
                    <td className="px-2 py-1.5 font-mono">{fmt(row.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
