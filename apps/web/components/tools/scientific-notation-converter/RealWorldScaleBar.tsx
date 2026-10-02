"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

const REFERENCE: { key: string; exponent: number }[] = [
  { key: "atom", exponent: -10 },
  { key: "virus", exponent: -7 },
  { key: "grain", exponent: -3 },
  { key: "human", exponent: 0 },
  { key: "building", exponent: 2 },
  { key: "earthDiameter", exponent: 7 },
  { key: "lightYear", exponent: 16 },
];

/** Type #10 (Log-Scale Magnitude Bar): real-world reference magnitudes spanning atom to light-year, with a live marker showing exactly where A's own exponent falls among them. */
export default function RealWorldScaleBar() {
  const t = useTranslations("tools.scientific-notation-converter.education.realWorldScale");
  const { dims } = useScientificNotationLive();
  const rawExponentA = deriveEffectiveA(dims).exponent;
  const exponentA = Math.min(16, Math.max(-10, rawExponentA));
  const pct = ((exponentA - -10) / (16 - -10)) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
            {REFERENCE.map((r) => (
              <div key={r.key} className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400 dark:bg-zinc-500" style={{ left: `${((r.exponent - -10) / 26) * 100}%` }} />
            ))}
            <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${pct}%` }} />
          </div>
          <div className="relative mt-2 h-14 w-full text-[10px]">
            {REFERENCE.map((r, i) => (
              <div key={r.key} className="absolute -translate-x-1/2 text-center" style={{ left: `${((r.exponent - -10) / 26) * 100}%`, top: `${(i % 2) * 24}px` }}>
                <div className="font-semibold text-zinc-600 dark:text-zinc-300">{t(`items.${r.key}`)}</div>
                <div className="text-zinc-400 dark:text-zinc-500">{`10^${r.exponent}`}</div>
              </div>
            ))}
          </div>
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.currentExponent"), value: `10^${Math.round(rawExponentA)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
