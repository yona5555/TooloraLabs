"use client";
import { useTranslations } from "next-intl";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import OhmsLawShareExportModal from "./OhmsLawShareExportModal";
import OhmsLive3D from "./OhmsLive3D";
import { FIELDS_BY_PAIR, UNIT, useOhmsModel, type OhmsQuantity } from "./OhmsLiveContext";

const GAUGE_DOMAIN_MAX = 5;
const ORDER: OhmsQuantity[] = ["voltage", "current", "resistance", "power"];

/**
 * Result card: the two solved quantities as the hero, then the deep live table beside the 3D
 * circuit (stacked in this narrow column), filling the stretched column height.
 */
export default function OhmsLawResult() {
  const t = useTranslations("tools.ohms-law-calculator.result");
  const tForm = useTranslations("tools.ohms-law-calculator.form");
  const { draft, result, solved, f: fmt } = useOhmsModel();

  if (result.error === "zero-current") return <ErrorCard heading={t("heading")} message={t("zeroCurrent")} />;
  if (result.error === "zero-resistance") return <ErrorCard heading={t("heading")} message={t("zeroResistance")} />;
  if (result.error === "zero-voltage") return <ErrorCard heading={t("heading")} message={t("zeroVoltage")} />;
  if (result.error === "zero-power") return <ErrorCard heading={t("heading")} message={t("zeroPower")} />;

  const known = FIELDS_BY_PAIR[draft.pair];
  const outs = ORDER.filter((q) => solved[q]);
  const operationLabel = tForm(`pair.${draft.pair}`);
  const heroValue = `${fmt(result.power)} W`;
  const sentence = t("sentence", { voltage: fmt(result.voltage), current: fmt(result.current), resistance: fmt(result.resistance) });

  const inputRows = known.map((q) => ({ label: tForm(`${q}Label`), value: `${fmt(result[q])} ${UNIT[q]}` }));
  const resultRows = ORDER.map((q) => ({ label: t(q), value: `${fmt(result[q])} ${UNIT[q]}` }));

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm lg:flex lg:h-full lg:flex-col dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <OhmsLawShareExportModal
          operationLabel={operationLabel}
          inputRows={inputRows}
          resultRows={resultRows}
          heroLabel={t("power")}
          heroValue={heroValue}
          sentence={sentence}
          gauge={{
            zones: [
              { from: 0, to: 0.5, color: "#22c55e" },
              { from: 0.5, to: 2, color: "#f59e0b" },
              { from: 2, to: GAUGE_DOMAIN_MAX, color: "#ef4444" },
            ],
            domainMin: 0,
            domainMax: GAUGE_DOMAIN_MAX,
            value: result.power,
            ticks: [0, 0.5, 2, GAUGE_DOMAIN_MAX],
          }}
        />
      </div>
      <div className="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6">
        <dl dir="ltr" className="grid grid-cols-2 gap-3 text-center">
          {outs.map((q) => (
            <div key={q}>
              <dt className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{t(q)}</dt>
              <dd className="font-mono text-3xl font-bold text-blue-700 dark:text-blue-400">
                {fmt(result[q])} <span className="text-lg font-semibold text-blue-500 dark:text-blue-300">{UNIT[q]}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p dir="ltr" className="mt-1 text-center font-mono text-sm text-zinc-500 dark:text-zinc-400">
          {`V = I × R = ${fmt(result.current)} A × ${fmt(result.resistance)} Ω = ${fmt(result.voltage)} V · P = ${fmt(result.power)} W`}
        </p>
        <p className="mt-2 text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{sentence}</p>
        <div className="mt-4 lg:flex lg:flex-1 lg:flex-col">
          <LiveTableFill>
            <OhmsLive3D />
          </LiveTableFill>
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
