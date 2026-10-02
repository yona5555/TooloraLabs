"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

const PREFIXES: { key: string; symbol: string; exponent: number }[] = [
  { key: "nano", symbol: "n", exponent: -9 },
  { key: "micro", symbol: "µ", exponent: -6 },
  { key: "milli", symbol: "m", exponent: -3 },
  { key: "base", symbol: "", exponent: 0 },
  { key: "kilo", symbol: "k", exponent: 3 },
  { key: "mega", symbol: "M", exponent: 6 },
  { key: "giga", symbol: "G", exponent: 9 },
];

function closestPrefix(exponent: number) {
  return PREFIXES.reduce((best, p) => (Math.abs(p.exponent - exponent) < Math.abs(best.exponent - exponent) ? p : best));
}

/** Type #2 (Flow Arrow with Embedded Numbers): the live A's exponent matched to its nearest real metric prefix — the same nano/micro/milli/kilo/mega/giga scale unit conversions actually use. */
export default function UnitScaleFlowDiagram() {
  const t = useTranslations("tools.scientific-notation-converter.education.unitScale");
  const { dims } = useScientificNotationLive();
  const exponentA = Math.round(deriveEffectiveA(dims).exponent);
  const match = closestPrefix(exponentA);
  const remainder = exponentA - match.exponent;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 flex flex-wrap items-center justify-center gap-1.5">
          {PREFIXES.map((p) => (
            <div
              key={p.key}
              className={`rounded-lg border px-2.5 py-1.5 text-center text-xs font-semibold transition ${
                p.key === match.key
                  ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300"
                  : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400"
              }`}
            >
              <div>{t(`names.${p.key}`)}</div>
              <div className="font-mono">{`10^${p.exponent}`}</div>
            </div>
          ))}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.nearestPrefix"), value: t(`names.${match.key}`), emphasize: true },
            { label: t("worked.remainder"), value: `10^${remainder}`, note: remainder === 0 ? t("worked.exactMatch") : undefined },
          ]}
        />
      </div>
    </SectionCard>
  );
}
