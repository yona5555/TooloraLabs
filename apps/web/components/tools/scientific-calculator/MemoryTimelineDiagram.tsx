"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

type Step = { op: "M+" | "M−" | "MC"; amount: number; result: number };
const MAX_STEPS = 5;

/** Type #9 (Timeline with Stations): the calculator's own memory keys (M+, M−, MC) — press them to build a real running timeline, each station showing the memory value at that point, exactly like the above-fold keypad's own M register. */
export default function MemoryTimelineDiagram() {
  const t = useTranslations("tools.scientific-calculator.education.memoryTimeline");
  const [amount, setAmount] = useState(5);
  const [memory, setMemory] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);

  function commit(op: Step["op"]) {
    const result = op === "MC" ? 0 : op === "M+" ? memory + amount : memory - amount;
    setMemory(result);
    setSteps((prev) => [...prev, { op, amount, result }].slice(-MAX_STEPS));
  }

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <div dir="ltr" className="mx-auto max-w-sm">
            <input type="range" min={1} max={20} step={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-blue-600 dark:accent-blue-400" aria-label={t("amountSliderLabel")} />
            <p className="mt-1 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">{`${t("amountLabel")}: ${amount}`}</p>
          </div>
          <div dir="ltr" className="mt-3 flex justify-center gap-2">
            <button type="button" onClick={() => commit("M+")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              M+
            </button>
            <button type="button" onClick={() => commit("M−")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              M−
            </button>
            <button type="button" onClick={() => commit("MC")} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
              MC
            </button>
          </div>

          {steps.length > 0 && (
            <div dir="ltr" className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-center text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                    <div>{s.op === "MC" ? "MC" : `${s.op} ${s.amount}`}</div>
                    <div className="font-mono">{s.result}</div>
                  </div>
                  {i < steps.length - 1 && <span className="text-zinc-300 dark:text-zinc-600">→</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.currentMemory"), value: `${memory}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
