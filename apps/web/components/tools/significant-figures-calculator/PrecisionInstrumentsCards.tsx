"use client";
import { useTranslations } from "next-intl";
import { countDecimalPlaces } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

const INSTRUMENTS: { key: string; minDecimals: number }[] = [
  { key: "bathroomScale", minDecimals: 0 },
  { key: "kitchenScale", minDecimals: 1 },
  { key: "digitalCaliper", minDecimals: 2 },
  { key: "analyticalBalance", minDecimals: 4 },
];

function closestInstrument(decimals: number) {
  return [...INSTRUMENTS].reverse().find((i) => decimals >= i.minDecimals) ?? INSTRUMENTS[0];
}

/** Type #16 (Side-by-Side Comparison Cards): the live A's own decimal-place count matched to the kind of real instrument that could plausibly have produced a reading that precise. */
export default function PrecisionInstrumentsCards() {
  const t = useTranslations("tools.significant-figures-calculator.education.precisionInstruments");
  const { dims } = useSignificantFiguresLive();
  const decimals = countDecimalPlaces(dims.rawValueA);
  const match = closestInstrument(decimals);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: dims.rawValueA })}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-2.5">
        {INSTRUMENTS.map((inst) => (
          <div
            key={inst.key}
            className={`rounded-xl border p-3 text-center transition ${
              inst.key === match.key ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40"
            }`}
          >
            <p className={`text-xs font-semibold ${inst.key === match.key ? "text-blue-700 dark:text-blue-300" : "text-zinc-500 dark:text-zinc-400"}`}>{t(`instruments.${inst.key}`)}</p>
            <p className="mt-1 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{t("decimalsLabel", { count: inst.minDecimals })}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.bestMatch"), value: t(`instruments.${match.key}`), emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
