"use client";
import { useTranslations } from "next-intl";
import { analyzeNotepad, evaluationSteps, scopeBefore } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { lineNo, num } from "./format";

/** Three notes solved with the same analyzer the page uses, one evaluation step per row. */
const EXAMPLES = [
  { key: "tip", lines: ["bill = 64.50", "tip = bill * 0.18", "total = bill + tip"] },
  { key: "precedence", lines: ["(3 + 4) * 2 ^ 2", "3 + (4 * 2) ^ 2", "3 + 4 * 2 ^ 2"] },
  { key: "savings", lines: ["balance = 1000", "balance = balance * 1.05", "balance = balance * 1.05"] },
] as const;

export default function NotepadWorkedExamples() {
  const t = useTranslations("tools.notepad-calculator.examples");

  return (
    <SectionCard id="worked-examples" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {EXAMPLES.map((ex) => {
          const text = ex.lines.join("\n");
          const a = analyzeNotepad(text);
          const steps = a.lines.flatMap((l) => {
            const ops = l.expr ? evaluationSteps(l.expr, scopeBefore(a, l.index)) : [];
            const rows = ops.map((s) => ({ k: t(`kind.${s.kind}`), v: s.text }));
            return [{ k: `${lineNo(l.index)} · ${l.text}`, v: "", head: true }, ...(rows.length ? rows : [{ k: t("kind.literal"), v: num(l.value as number) }])];
          });
          return (
            <article key={ex.key} className="flex flex-col rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{t(`${ex.key}.title`)}</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t(`${ex.key}.scenario`)}</p>
              <ol className="mt-3 flex-1 space-y-1.5 text-sm">
                {steps.map((s, i) =>
                  "head" in s ? (
                    <li key={i} dir="ltr" className="pt-1 text-start font-mono text-xs font-semibold text-blue-700 dark:text-blue-300">
                      {s.k}
                    </li>
                  ) : (
                    <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-dashed border-zinc-200 pb-1 dark:border-zinc-700">
                      <span className="text-zinc-600 dark:text-zinc-300">{s.k}</span>
                      <span dir="ltr" className="ms-auto font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {s.v}
                      </span>
                    </li>
                  )
                )}
              </ol>
              <p className="mt-3 flex items-baseline justify-between rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-500/10">
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">{t("answer")}</span>
                <span dir="ltr" className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300" data-testid={`example-${ex.key}`}>
                  {num(a.finalValue ?? 0)}
                </span>
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t(`${ex.key}.takeaway`)}</p>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
