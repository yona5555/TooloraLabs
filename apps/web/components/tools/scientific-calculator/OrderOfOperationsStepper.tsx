"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const STEPS = [
  { key: "start", expression: "3 + 4 × (2³ − 1)", partial: null as number | null },
  { key: "exponent", expression: "3 + 4 × (8 − 1)", partial: 8 },
  { key: "parens", expression: "3 + 4 × 7", partial: 7 },
  { key: "multiply", expression: "3 + 28", partial: 28 },
  { key: "add", expression: "31", partial: 31 },
];

/** Type #13 (Stepped Diagram): click through real PEMDAS precedence on a genuine expression — each step actually recomputes the partial result, rather than displaying the same four fixed panels every time. */
export default function OrderOfOperationsStepper() {
  const t = useTranslations("tools.scientific-calculator.education.orderOfOperations");
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <div dir="ltr" className="text-center">
            <p className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{current.expression}</p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t(`steps.${current.key}`)}</p>
          </div>
          <div dir="ltr" className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {t("prev")}
            </button>
            <div className="flex gap-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={t(`steps.${s.key}`)}
                  className={`h-2.5 w-2.5 rounded-full transition ${i === step ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-300 dark:bg-zinc-700"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={step === STEPS.length - 1}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-30"
            >
              {t("next")}
            </button>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.stepNumber"), value: `${step + 1} / ${STEPS.length}` },
            { label: t("worked.partialResult"), value: current.partial === null ? "—" : `${current.partial}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
