import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { StoichiometryResult as Result } from "./types";

type Props = {
  result: Result;
  targetFormula: string;
  targetUnit: "grams" | "moles";
  digitStyle: DigitStyle;
};

export default function StoichiometryResult({ result, targetFormula, targetUnit, digitStyle }: Props) {
  const t = useTranslations("tools.stoichiometry-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 5 });

  if (result.error) {
    const messageKey =
      result.error === "invalid-known-formula"
        ? "invalidKnownFormula"
        : result.error === "invalid-target-formula"
          ? "invalidTargetFormula"
          : result.error === "invalid-coefficient"
            ? "invalidCoefficient"
            : "invalidAmount";
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

  const unitLabel = targetUnit === "grams" ? "g" : t("molUnit");
  const copyText = `${targetFormula}: ${fmt(result.targetAmount)} ${unitLabel}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(result.targetAmount)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">{unitLabel}</span>
          </p>
          <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {t("targetAmountCaption", { formula: targetFormula })}
          </p>

          <dl dir="ltr" className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            <Stat label={t("knownMoles")} value={`${fmt(result.knownMoles)} ${t("molUnit")}`} />
            <Stat label={t("targetMoles")} value={`${fmt(result.targetMoles)} ${t("molUnit")}`} />
            <Stat label={t("knownMolarMass")} value={`${fmt(result.knownMolarMass)} g/mol`} />
            <Stat label={t("targetMolarMass")} value={`${fmt(result.targetMolarMass)} g/mol`} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{value}</dd>
    </div>
  );
}
