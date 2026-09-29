"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

const MARKS = [0, 3, 5, 7, 10];
const MAX_LOG = Math.log10(factorial(10));

/** Type #10 (Log-Scale Magnitude Bar): 0! through 10! span six orders of magnitude on a single linear scale, so this calculator's factorial key is shown on a log scale instead — the only chart type in the library built for exactly that spread. */
export default function FactorialMagnitudeScale() {
  const t = useTranslations("tools.scientific-calculator.education.functions.factorial");

  const marks = MARKS.map((n) => ({ n, value: factorial(n), pct: n === 0 ? 0.5 : (Math.log10(factorial(n)) / MAX_LOG) * 100 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full shrink-0 lg:w-[340px]">
          <div className="relative h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
            {marks.map((m) => (
              <div key={m.n} className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 dark:border-zinc-900 dark:bg-blue-400" style={{ left: `${m.pct}%` }} />
            ))}
          </div>
          <div className="relative mt-2 h-10 w-full text-xs">
            {marks.map((m) => (
              <div key={m.n} className="absolute -translate-x-1/2 text-center" style={{ left: `${m.pct}%` }}>
                <div className="font-semibold text-zinc-700 dark:text-zinc-200">{`${m.n}!`}</div>
                <div className="text-zinc-400 dark:text-zinc-500">{m.value.toLocaleString("en-US")}</div>
              </div>
            ))}
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={marks.map((m) => ({ label: `${m.n}!`, value: m.value.toLocaleString("en-US"), emphasize: m.n === 10, note: m.n === 10 ? t("worked.note") : undefined }))}
        />
      </div>
    </SectionCard>
  );
}
