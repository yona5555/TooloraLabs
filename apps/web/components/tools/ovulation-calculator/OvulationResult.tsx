import { useTranslations } from "next-intl";
import type { OvulationResult as Result } from "./types";
import CopyButton from "@/components/tool-ui/CopyButton";
import OvulationCycleTimeline from "./OvulationCycleTimeline";

type Props = {
  result: Result;
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function OvulationResult({ result }: Props) {
  const t = useTranslations("tools.ovulation-calculator.result");

  if (result.error || result.cycles.length === 0) {
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

  const first = result.cycles[0];

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton
          text={result.cycles
            .map((c) => `${t("cycle", { n: c.cycleNumber })}: ${t("ovulationDay")} ${formatDate(c.ovulationDateISO)}`)
            .join(", ")}
          className="!text-white dark:!text-white"
        />
      </div>
      <div className="p-4 lg:p-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatDate(first.ovulationDateISO)}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("nextOvulation")}</p>
        </div>

        <div className="mt-5">
          <OvulationCycleTimeline cycles={result.cycles} />
        </div>

        <ul className="mt-5 space-y-3 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          {result.cycles.map((cycle) => (
            <li key={cycle.cycleNumber} className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
              <p className="font-semibold text-zinc-700 dark:text-zinc-200">{t("cycle", { n: cycle.cycleNumber })}</p>
              <div className="mt-1.5 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  {t("fertileWindow")}: {formatDate(cycle.fertileWindowStartISO)} - {formatDate(cycle.fertileWindowEndISO)}
                </span>
                <span>
                  {t("nextPeriod")}: {formatDate(cycle.nextPeriodDateISO)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
