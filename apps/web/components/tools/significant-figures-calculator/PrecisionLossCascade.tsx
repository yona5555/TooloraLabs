"use client";
import { useTranslations } from "next-intl";
import { SignificantFiguresCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

const tool = new SignificantFiguresCalculator();
const STEP_B = ["0.1", "2.5", "1.5"];
const STEP_OPS = ["add", "multiply", "divide"] as const;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #13 (Stepped Diagram): the live A, carried through three real chained operations — each step's precision genuinely limited by whichever input in that step is least precise, so precision only ever shrinks or holds, never grows back. */
export default function PrecisionLossCascade() {
  const t = useTranslations("tools.significant-figures-calculator.education.precisionCascade");
  const { dims } = useSignificantFiguresLive();
  const numericA = Number(dims.rawValueA);
  if (dims.rawValueA.trim() === "" || !Number.isFinite(numericA)) return null;

  let currentRaw = dims.rawValueA;
  const steps: { op: string; value: number; sigFigs: number }[] = [];
  for (let i = 0; i < STEP_OPS.length; i++) {
    const output = tool.execute({ operation: STEP_OPS[i], rawValueA: currentRaw, rawValueB: STEP_B[i], roundToDigits: 10 }, { locale: "en-US" });
    if (!output.success || output.data.error) break;
    const resultSigFigs = output.data.resultSigFigs ?? 0;
    steps.push({ op: STEP_OPS[i], value: round3(output.data.roundedResult), sigFigs: resultSigFigs });
    currentRaw = `${output.data.roundedResult}`;
  }

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: dims.rawValueA })}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 font-mono text-sm">
        <span className="rounded-lg bg-zinc-100 px-2 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{dims.rawValueA}</span>
        {steps.map((s, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-zinc-300 dark:text-zinc-600">→</span>
            <span className={i === steps.length - 1 ? "rounded-lg bg-emerald-50 px-2 py-1 font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "rounded-lg bg-zinc-100 px-2 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}>{`${s.value} (${s.sigFigs} ${t("worked.sf")})`}</span>
          </span>
        ))}
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={steps.map((s, i) => ({ label: t(`worked.step${i + 1}`), value: `${s.value} — ${s.sigFigs} ${t("worked.sf")}`, emphasize: i === steps.length - 1 }))}
        />
      </div>
    </SectionCard>
  );
}
