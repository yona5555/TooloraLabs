"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const FORMS = [
  { coefficient: 450, exponent: 5 },
  { coefficient: 45, exponent: 6 },
  { coefficient: 4.5, exponent: 7 },
  { coefficient: 0.45, exponent: 8 },
];

/** Type #13 (Stepped Diagram): four different-looking (coefficient, exponent) pairs that all equal the exact same real number — only one of them (coefficient in [1, 10)) is the properly normalized form this tool's output always uses. */
export default function NormalizationSteppedDiagram() {
  const t = useTranslations("tools.scientific-notation-converter.education.normalization");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5 flex flex-wrap items-end gap-3">
        {FORMS.map((f, i) => {
          const isNormalized = f.coefficient >= 1 && f.coefficient < 10;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5" style={{ marginTop: `${i * 8}px` }}>
              <div
                className={`rounded-lg border px-3 py-2 text-center ${
                  isNormalized ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40"
                }`}
              >
                <p className={`font-mono text-sm font-bold ${isNormalized ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-700 dark:text-zinc-200"}`}>{`${f.coefficient}×10^${f.exponent}`}</p>
              </div>
              {isNormalized && <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{t("normalizedLabel")}</p>}
            </div>
          );
        })}
      </div>
      <div className="mt-5">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={FORMS.map((f) => ({
            label: `${f.coefficient}×10^${f.exponent}`,
            value: `${f.coefficient * Math.pow(10, f.exponent)}`,
            emphasize: f.coefficient >= 1 && f.coefficient < 10,
          }))}
        />
      </div>
    </SectionCard>
  );
}
