import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import DilutionFlasksDiagram from "./DilutionFlasksDiagram";
import type { MolarityMode, MolarityResult as Result } from "./types";

type Props = {
  result: Result;
  mode: MolarityMode;
  digitStyle: DigitStyle;
};

export default function MolarityResult({ result, mode, digitStyle }: Props) {
  const t = useTranslations("tools.molarity-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "zero-volume") {
    return <ErrorCard heading={t("heading")} message={t("zeroVolume")} />;
  }
  if (result.error === "zero-molar-mass") {
    return <ErrorCard heading={t("heading")} message={t("zeroMolarMass")} />;
  }
  if (result.error === "zero-denominator") {
    return <ErrorCard heading={t("heading")} message={t("zeroDenominator")} />;
  }

  if (mode === "concentration") {
    const copyText = `${fmt(result.molarity)} mol/L`;
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
          <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
            <h2 className="font-bold text-white">{t("heading")}</h2>
            <CopyButton text={copyText} className="!text-white dark:!text-white" />
          </div>
          <div className="p-4 lg:p-6">
            <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
              {fmt(result.molarity)} <span className="text-xl font-semibold text-blue-500 dark:text-blue-300">mol/L</span>
            </p>
            <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {t("molesSummary", { moles: fmt(result.moles) })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const copyText = `C1V1=C2V2 — C1 ${fmt(result.c1)}, V1 ${fmt(result.v1)}, C2 ${fmt(result.c2)}, V2 ${fmt(result.v2)}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>
        <div className="p-4 lg:p-6">
          <dl dir="ltr" className="grid grid-cols-2 gap-4 text-center">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("c1")}</dt>
              <dd className="font-mono text-xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.c1)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("v1")}</dt>
              <dd className="font-mono text-xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.v1)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("c2")}</dt>
              <dd className="font-mono text-xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.c2)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("v2")}</dt>
              <dd className="font-mono text-xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.v2)}</dd>
            </div>
          </dl>

          <DilutionFlasksDiagram
            concentration1={result.c1}
            volume1={result.v1}
            concentration2={result.c2}
            volume2={result.v2}
            label1={t("diagramStock")}
            label2={t("diagramDiluted")}
            caption={t("diagramCaption")}
          />
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{heading}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
