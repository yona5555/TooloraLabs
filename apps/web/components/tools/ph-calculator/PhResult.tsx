import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import PhScaleDiagram from "./PhScaleDiagram";
import type { PhResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

function splitScientific(value: number): { mantissa: number; exponent: number } {
  if (value === 0) return { mantissa: 0, exponent: 0 };
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  return { mantissa, exponent };
}

function ConcentrationValue({ value, digitStyle }: { value: number; digitStyle: DigitStyle }) {
  const { mantissa, exponent } = splitScientific(value);
  return (
    <span dir="ltr">
      {formatLocalizedNumber(mantissa, digitStyle, { maximumFractionDigits: 2 })} × 10
      <sup>{exponent}</sup> M
    </span>
  );
}

export default function PhResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.ph-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  if (result.error === "non-positive-concentration") {
    return <ErrorCard heading={t("heading")} message={t("nonPositiveConcentration")} />;
  }

  const copyText = `pH ${fmt(result.pH)}, pOH ${fmt(result.pOH)}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(result.pH)}
          </p>
          <p className="mt-2 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            {t(`classification.${result.classification}`)}
          </p>

          <PhScaleDiagram pH={result.pH} caption={t("diagramCaption", { value: fmt(result.pH) })} />

          <dl dir="ltr" className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("pOH")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmt(result.pOH)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("hConcentration")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                <ConcentrationValue value={result.hConcentration} digitStyle={digitStyle} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("ohConcentration")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                <ConcentrationValue value={result.ohConcentration} digitStyle={digitStyle} />
              </dd>
            </div>
          </dl>
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
