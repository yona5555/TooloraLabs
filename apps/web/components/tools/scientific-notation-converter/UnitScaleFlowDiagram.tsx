"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const NANOMETERS = 750;
const CONVERSION_EXPONENT = -9;

/** Type #2 (Flow Arrow with Embedded Numbers): a real wavelength of visible red light, in nanometers, converted to meters via its own scientific-notation factor — the same 10^-9 that defines the "nano-" prefix. */
export default function UnitScaleFlowDiagram() {
  const t = useTranslations("tools.scientific-notation-converter.education.unitScale");
  const meters = NANOMETERS * Math.pow(10, CONVERSION_EXPONENT);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`${NANOMETERS} nm`}</p>
          <p className="text-xs text-zinc-400">{t("startLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`× 10^${CONVERSION_EXPONENT}`}</p>
          <p className="text-xs text-blue-500/80">{t("factorLabel")}</p>
        </div>
        <ArrowRight className="shrink-0 text-blue-500" size={20} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{`${meters} m`}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("resultLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: `${NANOMETERS} × 10^${CONVERSION_EXPONENT}` },
            { label: t("worked.result"), value: `${meters} m`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
