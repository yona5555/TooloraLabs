"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

type Step = { coefficient: number; exponent: number };

/** Type #13 (Stepped Diagram): the live A's own coefficient and exponent, walked through the real normalization steps a calculator runs internally whenever a coefficient strays outside [1, 10). In toScientific mode A is the engine's own normalized reading of standardValue (always already in range); switch to toStandard/multiply/divide to type a genuinely out-of-range coefficient and see real steps. */
export default function NormalizationSteppedDiagram() {
  const t = useTranslations("tools.scientific-notation-converter.education.normalizationSteps");
  const { dims } = useScientificNotationLive();
  const a = deriveEffectiveA(dims);
  if (a.coefficient === 0) return null;

  const steps: Step[] = [{ coefficient: a.coefficient, exponent: Math.round(a.exponent) }];
  let c = a.coefficient;
  let e = Math.round(a.exponent);
  let guard = 0;
  while (Math.abs(c) >= 10 && guard < 20) {
    c /= 10;
    e += 1;
    steps.push({ coefficient: Math.round(c * 1000) / 1000, exponent: e });
    guard++;
  }
  while (Math.abs(c) < 1 && guard < 40) {
    c *= 10;
    e -= 1;
    steps.push({ coefficient: Math.round(c * 1000) / 1000, exponent: e });
    guard++;
  }

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 flex flex-wrap items-center justify-center gap-2 font-mono text-sm">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={i === steps.length - 1 ? "rounded-lg bg-emerald-50 px-2 py-1 font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}>{`${s.coefficient} × 10^${s.exponent}`}</span>
              {i < steps.length - 1 && <span className="text-zinc-300 dark:text-zinc-600">→</span>}
            </div>
          ))}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.stepsTaken"), value: `${steps.length - 1}`, note: steps.length === 1 ? t("worked.alreadyNormalized") : undefined },
            { label: t("worked.result"), value: `${steps[steps.length - 1].coefficient} × 10^${steps[steps.length - 1].exponent}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
