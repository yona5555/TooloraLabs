"use client";
import { useTranslations } from "next-intl";
import SwIndicatorCard from "./SwIndicatorCard";
import { PACE_TONES } from "./swMath";
import { SPEECH_PACE_PRESETS, type SpeechPacePreset } from "./types";
import { useSwLive } from "./SwLiveContext";

const KEYS = ["formal", "normal", "fast"] as const;

/** Side-by-Side Comparison rows (§31 #4): the same speech at each pace preset, labelled with the quick-reference delivery styles; click a row to use it. */
export default function SwPaceCompare() {
  const t = useTranslations("tools.speech-word-count-calculator.live.presets");
  const tf = useTranslations("tools.speech-word-count-calculator.form.presets");
  const tq = useTranslations("tools.speech-word-count-calculator.quickReference");
  const { result, wpm, preset, setPreset, secondsFor, f, clock, timeLabel } = useSwLive();
  const words = result.wordCount;
  const styles: Record<(typeof KEYS)[number], string> = { formal: tq("paceFormal"), normal: tq("paceNormal"), fast: tq("paceFast") };
  const rows: { key: SpeechPacePreset; rate: number; label: string; style?: string }[] = [
    ...KEYS.map((k) => ({ key: k, rate: SPEECH_PACE_PRESETS[k] as number, label: tf(k), style: styles[k] })),
    ...(preset === "custom" ? [{ key: "custom" as const, rate: wpm, label: tf("custom") }] : []),
  ];
  const longest = Math.max(...rows.map((r) => secondsFor(words, r.rate)), 1);
  const formal = secondsFor(words, SPEECH_PACE_PRESETS.formal);
  const fast = secondsFor(words, SPEECH_PACE_PRESETS.fast);

  const indicator = (
    <div className="w-full sm:w-[330px]">
      <ul className="space-y-2">
        {rows.map((r) => {
          const sec = secondsFor(words, r.rate);
          const on = preset === r.key;
          return (
            <li key={r.key}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setPreset(r.key)}
                className={`w-full rounded-lg px-2 py-1.5 text-start transition ${on ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                <span className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                    {r.label} <span dir="ltr" className="font-normal text-zinc-400">({t("wpm", { wpm: f(r.rate) })})</span>
                  </span>
                  <span dir="ltr" className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">{clock(sec)}</span>
                </span>
                <span className="mt-1 block h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span className={`block h-3 rounded-full ${PACE_TONES[r.key].bg}`} style={{ width: `${(sec / longest) * 100}%`, transition: "width 300ms ease" }} />
                </span>
                {r.style && <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{r.style}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{t("hint")}</p>
    </div>
  );

  return (
    <SwIndicatorCard
      mini={0}
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        ...rows.map((r) => ({ label: r.label, value: timeLabel(secondsFor(words, r.rate)), note: `${f(words)} ÷ ${f(r.rate)} × ${f(60)}` })),
        { label: t("spread"), value: clock(formal - fast), emphasize: true, note: t("spreadNote") },
      ]}
    />
  );
}
