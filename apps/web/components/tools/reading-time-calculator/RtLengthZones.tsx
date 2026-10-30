"use client";
import { useTranslations } from "next-intl";
import { READING_SPEED_PRESETS } from "@tooloralabs/tools";
import RtIndicatorCard from "./RtIndicatorCard";
import { LENGTH_ZONES, zoneOf } from "./rtMath";
import { useRtLive } from "./RtLiveContext";

/** Zone Strip (§31 #19): where this text lands among common read-length bands, with the slow–fast preset span shaded. */
export default function RtLengthZones() {
  const t = useTranslations("tools.reading-time-calculator.live.zones");
  const { result, wpm, secondsFor, f, clock } = useRtLive();
  const words = result.wordCount;
  const zone = zoneOf(result.totalSeconds);
  const current = LENGTH_ZONES[zone.index];
  const slowPos = zoneOf(secondsFor(words, READING_SPEED_PRESETS.slow)).position;
  const fastPos = zoneOf(secondsFor(words, READING_SPEED_PRESETS.fast)).position;
  const next = LENGTH_ZONES[zone.index + 1];
  const prevMax = zone.index > 0 ? LENGTH_ZONES[zone.index - 1].max : 0;
  const wordsToNext = next ? Math.max(0, Math.ceil(((current.max + 0.5) / 60) * wpm) - words) : 0;

  const indicator = (
    <div className="w-full sm:w-[340px]">
      <div dir="ltr" className="relative pt-9 pb-1">
        <div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${zone.position * 100}%`, transition: "left 400ms cubic-bezier(.3,1.3,.5,1)" }}
        >
          <span className="rounded-md bg-zinc-900 px-1.5 py-0.5 font-mono text-xs font-bold whitespace-nowrap text-white dark:bg-white dark:text-zinc-900">{clock(result.totalSeconds)}</span>
          <span className="h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-zinc-900 dark:border-t-white" />
        </div>
        <div className="relative flex h-7 overflow-hidden rounded-lg">
          {LENGTH_ZONES.map((z, i) => (
            <div key={z.key} className={`flex-1 ${z.fill} ${i === zone.index ? "opacity-100" : "opacity-45"} border-e border-white/70 transition-opacity last:border-0 dark:border-zinc-900/70`} />
          ))}
          <div
            className="absolute inset-y-1 rounded bg-white/45 ring-1 ring-white dark:bg-zinc-900/40 dark:ring-zinc-200/60"
            style={{ left: `${fastPos * 100}%`, width: `${Math.max(0.5, (slowPos - fastPos) * 100)}%`, transition: "all 400ms ease" }}
            title={t("spanTitle")}
          />
        </div>
        <div className="mt-1 flex text-xs text-zinc-500 dark:text-zinc-400">
          {LENGTH_ZONES.map((z, i) => (
            <span key={z.key} className="flex-1 text-center font-mono">{`${f(i === 0 ? 0 : LENGTH_ZONES[i - 1].max / 60)}–${f(z.max / 60)}`}</span>
          ))}
        </div>
      </div>
      <div className="mt-1 flex text-xs font-semibold">
        {LENGTH_ZONES.map((z, i) => (
          <span key={z.key} className={`flex-1 text-center ${i === zone.index ? z.text : "text-zinc-400 dark:text-zinc-500"}`}>{t(z.key)}</span>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("legend")}</p>
    </div>
  );

  return (
    <RtIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("time"), value: clock(result.totalSeconds) },
        { label: t("band"), value: t(current.key), emphasize: true, note: t("bandRange", { from: f(prevMax / 60), to: f(current.max / 60) }) },
        { label: t("presetSpan"), value: `${clock(secondsFor(words, READING_SPEED_PRESETS.fast))} – ${clock(secondsFor(words, READING_SPEED_PRESETS.slow))}` },
        next
          ? { label: t("toNext", { band: t(next.key) }), value: t("words", { n: f(wordsToNext) }), note: `${f(current.max / 60)} × ${f(wpm)} − ${f(words)}` }
          : { label: t("toNext", { band: "—" }), value: "—" },
      ]}
    />
  );
}
