import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import OhmsLawTriangleDiagram from "./OhmsLawTriangleDiagram";
import type { OhmsLawKnownPair, OhmsLawResult as Result } from "./types";

type Props = {
  result: Result;
  knownPair: OhmsLawKnownPair;
  digitStyle: DigitStyle;
};

const COMPUTED_BY_PAIR: Record<OhmsLawKnownPair, ("voltage" | "current" | "resistance")[]> = {
  VI: ["resistance"],
  VR: ["current"],
  IR: ["voltage"],
  VP: ["current", "resistance"],
  IP: ["voltage", "resistance"],
  RP: ["voltage", "current"],
};

export default function OhmsLawResult({ result, knownPair, digitStyle }: Props) {
  const t = useTranslations("tools.ohms-law-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  if (result.error === "zero-current") {
    return <ErrorCard heading={t("heading")} message={t("zeroCurrent")} />;
  }
  if (result.error === "zero-resistance") {
    return <ErrorCard heading={t("heading")} message={t("zeroResistance")} />;
  }
  if (result.error === "zero-voltage") {
    return <ErrorCard heading={t("heading")} message={t("zeroVoltage")} />;
  }
  if (result.error === "zero-power") {
    return <ErrorCard heading={t("heading")} message={t("zeroPower")} />;
  }

  const copyText = `${t("voltage")}: ${fmt(result.voltage)} V, ${t("current")}: ${fmt(result.current)} A, ${t("resistance")}: ${fmt(result.resistance)} Ω, ${t("power")}: ${fmt(result.power)} W`;

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
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("voltage")}</dt>
              <dd className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.voltage)} V</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("current")}</dt>
              <dd className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.current)} A</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("resistance")}</dt>
              <dd className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.resistance)} Ω</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("power")}</dt>
              <dd className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-400">{fmt(result.power)} W</dd>
            </div>
          </dl>

          <OhmsLawTriangleDiagram
            voltageText={`V=${fmt(result.voltage)}`}
            currentText={`I=${fmt(result.current)}`}
            resistanceText={`R=${fmt(result.resistance)}`}
            highlighted={COMPUTED_BY_PAIR[knownPair]}
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
