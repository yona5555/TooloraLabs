import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import VectorDiagram from "./VectorDiagram";
import type { VectorResult as Result } from "./types";

type Props = {
  result: Result;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  digitStyle: DigitStyle;
};

export default function VectorResult({ result, ax, ay, bx, by, digitStyle }: Props) {
  const t = useTranslations("tools.vector-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });
  const na = t("notApplicable");

  const copyText = `${t("dotProduct")}: ${fmt(result.dotProduct)}, ${t("magnitudeA")}: ${fmt(result.magnitudeA)}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          {result.error === "zero-vector-a" && <p className="mb-3 text-center text-sm text-amber-600 dark:text-amber-400">{t("zeroVectorA")}</p>}
          {result.error === "zero-vector-b" && <p className="mb-3 text-center text-sm text-amber-600 dark:text-amber-400">{t("zeroVectorB")}</p>}

          <VectorDiagram
            ax={ax}
            ay={ay}
            bx={bx}
            by={by}
            sumX={result.sumX}
            sumY={result.sumY}
            labelA={t("diagramA")}
            labelB={t("diagramB")}
            labelSum={t("diagramSum")}
            caption={t("diagramCaption")}
          />

          <dl dir="ltr" className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-3 dark:border-zinc-800">
            <Stat label={t("magnitudeA")} value={fmt(result.magnitudeA)} />
            <Stat label={t("magnitudeB")} value={fmt(result.magnitudeB)} />
            <Stat label={t("dotProduct")} value={fmt(result.dotProduct)} />
            <Stat label={t("sum")} value={`(${fmt(result.sumX)}, ${fmt(result.sumY)}, ${fmt(result.sumZ)})`} />
            <Stat label={t("difference")} value={`(${fmt(result.differenceX)}, ${fmt(result.differenceY)}, ${fmt(result.differenceZ)})`} />
            <Stat label={t("crossProduct")} value={`(${fmt(result.crossX)}, ${fmt(result.crossY)}, ${fmt(result.crossZ)})`} />
            <Stat label={t("angleBetween")} value={result.angleBetweenDegrees === null ? na : `${fmt(result.angleBetweenDegrees)}°`} />
            <Stat
              label={t("unitVectorA")}
              value={result.unitAX === null ? na : `(${fmt(result.unitAX)}, ${fmt(result.unitAY!)}, ${fmt(result.unitAZ!)})`}
            />
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
      <dd dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}
