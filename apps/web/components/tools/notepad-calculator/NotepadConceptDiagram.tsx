"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Static, illustrative concept diagram — a single fixed example expression (not the
 * user's live text) showing the order operations actually happen in: parentheses first,
 * then multiplication/division, then addition/subtraction — the same order this tool's
 * expression evaluator (shared with the Graphing Calculator) always applies.
 */
export default function NotepadConceptDiagram() {
  const d = useTranslations("tools.notepad-calculator.aboveFold.conceptDiagram");

  const steps = [
    { key: "parens", expr: "(2 + 3) * 4", highlight: "(2 + 3)" },
    { key: "multiply", expr: "5 * 4", highlight: "5 * 4" },
    { key: "result", expr: "20", highlight: "20" },
  ];

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2 sm:gap-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center font-mono text-sm dark:border-zinc-700 dark:bg-zinc-800">
              <div className="text-zinc-900 dark:text-zinc-100">{step.expr}</div>
              <div className="mt-1 text-[10px] font-sans font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{d(`step.${step.key}`)}</div>
            </div>
            {i < steps.length - 1 && (
              <span className="text-lg text-zinc-400 dark:text-zinc-500" aria-hidden="true">
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
