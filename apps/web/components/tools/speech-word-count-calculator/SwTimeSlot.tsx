"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SwIndicatorCard from "./SwIndicatorCard";
import { SLOT_MINUTES } from "./swMath";
import { useSwLive } from "./SwLiveContext";

/** Target Fill Gauge (§31 #3): pick the time slot you were given; the bar shows how much of it the speech fills and, if it runs over, selects the words to cut. */
export default function SwTimeSlot() {
  const t = useTranslations("tools.speech-word-count-calculator.live.slot");
  const { result, wpm, tokens, text, secondsFor, jumpTo, f, pct, clock } = useSwLive();
  const words = result.wordCount;
  const speech = secondsFor(words);
  const fitting = SLOT_MINUTES.find((m) => m * 60 >= speech) ?? SLOT_MINUTES[SLOT_MINUTES.length - 1];
  const [chosen, setChosen] = useState<number | null>(null);
  const slot = chosen ?? fitting;
  const slotSec = slot * 60;
  const budget = Math.floor(slot * wpm);
  const diff = words - budget;
  const over = diff > 0;
  const scale = Math.max(slotSec, speech) || 1;
  const cutTok = over ? tokens[Math.min(tokens.length - 1, budget)] : undefined;

  const indicator = (
    <div className="w-full sm:w-[340px]">
      <div className="flex flex-wrap gap-1" role="group" aria-label={t("slotLabel")}>
        {SLOT_MINUTES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={slot === m}
            onClick={() => setChosen(m)}
            className={`rounded-md border px-2 py-0.5 font-mono text-xs font-semibold transition ${
              slot === m ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {t("minutes", { n: f(m) })}
          </button>
        ))}
      </div>
      <div dir="ltr" className="relative mt-4 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`absolute inset-y-0 left-0 rounded-lg ${over ? "bg-rose-500 dark:bg-rose-500" : "bg-emerald-500 dark:bg-emerald-500"}`}
          style={{ width: `${(speech / scale) * 100}%`, transition: "width 350ms ease, background-color 250ms ease" }}
        />
        {over && <div className="absolute inset-y-0 left-0 rounded-s-lg bg-emerald-500/90" style={{ width: `${(slotSec / scale) * 100}%`, transition: "width 350ms ease" }} />}
        <div className="absolute inset-y-[-6px] w-0.5 bg-zinc-900 dark:bg-zinc-100" style={{ left: `${(slotSec / scale) * 100}%`, transition: "left 350ms ease" }} />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50">{clock(speech)}</span>
      </div>
      <div dir="ltr" className="mt-1 flex justify-between font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>{clock(0)}</span>
        <span>{t("slotMark", { clock: clock(slotSec) })}</span>
      </div>
      <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${over ? "bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"}`}>
        {over ? t("overBy", { n: f(diff), clock: clock(speech - slotSec) }) : t("underBy", { n: f(-diff), clock: clock(slotSec - speech) })}
      </p>
      {cutTok && (
        <button
          type="button"
          onClick={() => jumpTo(cutTok.start, text.length, { kind: "word", index: budget })}
          className="mt-2 text-[11px] font-semibold text-amber-700 underline-offset-2 hover:underline dark:text-amber-300"
        >
          {t("selectCut", { n: f(diff) })}
        </button>
      )}
    </div>
  );

  return (
    <SwIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("slot"), value: clock(slotSec) },
        { label: t("budget"), value: f(budget), note: `${f(slot)} × ${f(wpm)}` },
        { label: t("words"), value: f(words) },
        { label: t("fill"), value: pct(speech / slotSec), note: `${clock(speech)} ÷ ${clock(slotSec)}` },
        { label: over ? t("toCut") : t("toAdd"), value: f(Math.abs(diff)), emphasize: true, note: over ? `${f(words)} − ${f(budget)}` : `${f(budget)} − ${f(words)}` },
      ]}
    />
  );
}
