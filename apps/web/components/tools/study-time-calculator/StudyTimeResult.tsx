import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import PomodoroTimelineDiagram from "./PomodoroTimelineDiagram";
import type { StudyTimeResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
};

export default function StudyTimeResult({ result, digitStyle }: Props) {
  const t = useTranslations("tools.study-time-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  if (result.error === "invalid-total-minutes") return <ErrorCard heading={t("heading")} message={t("invalidTotalMinutes")} />;
  if (result.error === "invalid-work-minutes") return <ErrorCard heading={t("heading")} message={t("invalidWorkMinutes")} />;
  if (result.error === "invalid-break-minutes") return <ErrorCard heading={t("heading")} message={t("invalidBreakMinutes")} />;
  if (result.error === "invalid-cycle-length") return <ErrorCard heading={t("heading")} message={t("invalidCycleLength")} />;
  if (result.error === "session-too-short") return <ErrorCard heading={t("heading")} message={t("sessionTooShort")} />;

  const copyText = `${t("completedPomodoros")}: ${fmt(result.completedPomodoros)}, ${t("totalWorkMinutes")}: ${fmt(result.totalWorkMinutes)} min`;

  const utilizationPercent = result.scheduledMinutes > 0 ? (result.scheduledMinutes / (result.scheduledMinutes + result.leftoverMinutes)) * 100 : 0;
  const utilizationBand = utilizationPercent >= 85 ? "tight" : utilizationPercent >= 50 ? "wellPlanned" : "short";
  const utilizationColor = utilizationBand === "tight" ? "fill-emerald-600 dark:fill-emerald-400" : utilizationBand === "wellPlanned" ? "fill-blue-600 dark:fill-blue-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
          <CopyButton text={copyText} className="!text-white dark:!text-white" />
        </div>

        <div className="p-4 lg:p-6">
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(result.completedPomodoros)}
          </p>
          <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("completedPomodoros")}</p>

          <div className="mt-4 flex justify-center border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <RatioGauge
              value={utilizationPercent}
              domainMin={0}
              domainMax={100}
              zones={[
                { key: "short", from: 0, to: 50, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
                { key: "wellPlanned", from: 50, to: 85, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
                { key: "tight", from: 85, to: 100, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
              ]}
              valueLabel={`${fmt(utilizationPercent)}%`}
              caption={t(`utilization.${utilizationBand}`)}
              captionColorClass={utilizationColor}
              ticks={[0, 50, 85, 100]}
            />
          </div>

          <PomodoroTimelineDiagram
            totalWorkMinutes={result.totalWorkMinutes}
            totalBreakMinutes={result.totalBreakMinutes}
            leftoverMinutes={result.leftoverMinutes}
            workLabel={t("diagramWork")}
            breakLabel={t("diagramBreak")}
            leftoverLabel={t("diagramLeftover")}
            caption={t("diagramCaption")}
          />

          <dl dir="ltr" className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-3 dark:border-zinc-800">
            <Stat label={t("shortBreaksTaken")} value={fmt(result.shortBreaksTaken)} />
            <Stat label={t("longBreaksTaken")} value={fmt(result.longBreaksTaken)} />
            <Stat label={t("totalWorkMinutes")} value={`${fmt(result.totalWorkMinutes)} min`} />
            <Stat label={t("totalBreakMinutes")} value={`${fmt(result.totalBreakMinutes)} min`} />
            <Stat label={t("leftoverMinutes")} value={`${fmt(result.leftoverMinutes)} min`} />
            <Stat label={t("scheduledMinutes")} value={`${fmt(result.scheduledMinutes)} min`} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

function ErrorCard({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{heading}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
      </div>
    </div>
  );
}
