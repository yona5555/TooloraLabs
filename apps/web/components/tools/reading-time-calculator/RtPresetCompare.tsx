"use client";
import { useTranslations } from "next-intl";
import { READING_SPEED_PRESETS } from "@tooloralabs/tools";
import RtIndicatorCard from "./RtIndicatorCard";
import { useRtLive } from "./RtLiveContext";
import type { ReadingSpeedPreset } from "./types";

const ROWS: { key: Exclude<ReadingSpeedPreset, "custom">; bar: string }[] = [
  { key: "slow", bar: "bg-sky-500 dark:bg-sky-400" },
  { key: "average", bar: "bg-blue-600 dark:bg-blue-500" },
  { key: "fast", bar: "bg-indigo-600 dark:bg-indigo-400" },
];

/** Side-by-Side Comparison rows (§31 #4): the same text at each speed preset; click a row to switch the calculator to it. */
export default function RtPresetCompare() {
  const t = useTranslations("tools.reading-time-calculator.live.presets");
  const tf = useTranslations("tools.reading-time-calculator.form.presets");
  const { result, wpm, preset, setPreset, secondsFor, f, clock, timeLabel } = useRtLive();
  const words = result.wordCount;
  const rows = [
    ...ROWS.map((r) => ({ ...r, wpm: READING_SPEED_PRESETS[r.key] as number, label: tf(r.key) })),
    ...(preset === "custom" ? [{ key: "custom" as const, bar: "bg-amber-500 dark:bg-amber-400", wpm, label: tf("custom") }] : []),
  ];
  const longest = Math.max(...rows.map((r) => secondsFor(words, r.wpm)), 1);
  const slow = secondsFor(words, READING_SPEED_PRESETS.slow);
  const fast = secondsFor(words, READING_SPEED_PRESETS.fast);

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <ul className="space-y-2">
        {rows.map((r) => {
          const sec = secondsFor(words, r.wpm);
          const activeRow = preset === r.key;
          return (
            <li key={r.key}>
              <button
                type="button"
                aria-pressed={activeRow}
                onClick={() => setPreset(r.key)}
                className={`w-full rounded-lg px-2 py-1.5 text-start transition ${activeRow ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                <span className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                    {r.label} <span dir="ltr" className="font-normal text-zinc-400">({t("wpm", { wpm: f(r.wpm) })})</span>
                  </span>
                  <span dir="ltr" className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">{clock(sec)}</span>
                </span>
                <span className="mt-1 block h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span className={`block h-3 rounded-full ${r.bar}`} style={{ width: `${(sec / longest) * 100}%`, transition: "width 300ms ease" }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{t("hint")}</p>
    </div>
  );

  return (
    <RtIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        ...rows.map((r) => ({ label: r.label, value: timeLabel(secondsFor(words, r.wpm)), note: `${f(words)} ÷ ${f(r.wpm)} × ${f(60)}` })),
        { label: t("spread"), value: clock(slow - fast), emphasize: true, note: t("spreadNote") },
      ]}
    />
  );
}
