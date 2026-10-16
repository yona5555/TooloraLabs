"use client";
import { useTranslations } from "next-intl";
import SwIndicatorCard from "./SwIndicatorCard";
import { useSwLive } from "./SwLiveContext";

type Step = { key: string; value: string; op?: string; tone: string };

/** Formula Diagram (§31 #18): the calculator's exact steps — divide, convert to seconds, round, split into minutes and seconds. */
export default function SwFormula() {
  const tq = useTranslations("tools.speech-word-count-calculator.quickReference");
  const t = useTranslations("tools.speech-word-count-calculator.live.formula");
  const { result, wpm, f, timeLabel } = useSwLive();
  const words = result.wordCount;
  const rawMinutes = words / wpm;
  const rawSeconds = rawMinutes * 60;

  const steps: Step[] = [
    { key: "words", value: f(words), tone: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200" },
    { key: "wpm", value: f(wpm), op: "÷", tone: "border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200" },
    { key: "minutes", value: f(rawMinutes, 3), op: "=", tone: "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200" },
    { key: "rawSeconds", value: f(rawSeconds, 2), op: `× ${f(60)}`, tone: "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200" },
    { key: "rounded", value: f(result.totalSeconds), op: "≈", tone: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200" },
  ];

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <ol className="space-y-1.5">
        {steps.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span dir="ltr" className="w-12 shrink-0 text-center font-mono text-sm font-bold text-zinc-400 dark:text-zinc-500">{s.op ?? ""}</span>
            <span className={`flex flex-1 items-center justify-between gap-2 rounded-lg border px-3 py-1.5 transition-colors ${s.tone}`}>
              <span className="text-xs font-medium">{t(s.key)}</span>
              <span dir="ltr" className="font-mono text-base font-bold tabular-nums">{s.value}</span>
            </span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-center text-sm font-bold text-zinc-400 dark:text-zinc-500">→</span>
          <span className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-lg font-bold text-white">{timeLabel(result.totalSeconds)}</span>
        </li>
      </ol>
      <p dir="ltr" className="mt-2 text-center font-mono text-[11px] text-zinc-500 dark:text-zinc-400">Speaking time = word count ÷ words per minute</p>
    </div>
  );

  return (
    <SwIndicatorCard
      title={tq("title")}
      intro={tq("intro")}
      indicator={indicator}
      rows={[
        { label: t("minutes"), value: f(rawMinutes, 3), note: `${f(words)} ÷ ${f(wpm)}` },
        { label: t("rawSeconds"), value: f(rawSeconds, 2), note: `${f(rawMinutes, 3)} × ${f(60)}` },
        { label: t("rounded"), value: f(result.totalSeconds), note: t("roundNote") },
        { label: t("split"), value: `${f(result.minutes)} × ${f(60)} + ${f(result.seconds)}`, note: `${f(result.totalSeconds)} = ${f(result.minutes * 60)} + ${f(result.seconds)}` },
        { label: t("result"), value: timeLabel(result.totalSeconds), emphasize: true },
      ]}
    />
  );
}
