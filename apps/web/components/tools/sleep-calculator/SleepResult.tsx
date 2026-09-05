import { useTranslations } from "next-intl";
import type { SleepResult as Result, SleepMode } from "./types";
import { minutesToTimeString } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import SleepCycleDiagram from "./SleepCycleDiagram";

type Props = {
  result: Result;
  mode: SleepMode;
};

function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function SleepResult({ result, mode }: Props) {
  const t = useTranslations("tools.sleep-calculator.result");

  if (result.error) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(`errors.${result.error}`)}</p>
        </div>
      </div>
    );
  }

  const heading = mode === "wakeUp" ? t("headingBedtimes") : t("headingWakeUpTimes");

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{heading}</h2>
        <CopyButton
          text={result.options.map((o) => `${formatClock(o.clockMinutes)} (${o.cycles} ${t("cycles")})`).join(", ")}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <SleepCycleDiagram options={result.options} />

        <ul className="mt-5 space-y-2">
          {result.options.map((option, index) => (
            <li
              key={option.cycles}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                index < 2 ? "border-blue-400 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-zinc-100 dark:border-zinc-800"
              }`}
            >
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatClock(option.clockMinutes)}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("sleepDuration", { hours: (option.sleepMinutes / 60).toFixed(1) })} · {t("cyclesCount", { count: option.cycles })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
