"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Static step-by-step evaluation of one concrete expression, showing the
 * standard order of operations (parentheses → exponents → ×÷ → +−) that this
 * calculator's expression parser follows — directly explains HOW a
 * multi-operator expression typed into the keypad above resolves to a
 * single result, distinct from UnitCircleDiagram (which covers trig only).
 */
const STEPS: { key: string; expression: string }[] = [
  { key: "start", expression: "3 + 4 × 2² − 1" },
  { key: "exponent", expression: "3 + 4 × 4 − 1" },
  { key: "multiply", expression: "3 + 16 − 1" },
  { key: "addSubtract", expression: "18" },
];

export default function OrderOfOperationsDiagram() {
  const d = useTranslations("tools.scientific-calculator.orderOfOperationsDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-col gap-2">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
            <span className="w-28 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{d(`steps.${step.key}`)}</span>
            <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{step.expression}</span>
            {i === STEPS.length - 1 && (
              <span className="ms-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {d("resultBadge")}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{d("caption")}</p>
    </SectionCard>
  );
}
