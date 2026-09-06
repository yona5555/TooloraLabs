"use client";
import { useTranslations } from "next-intl";
import { Play, Pause, Square } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { PlaybackState } from "./types";

type Props = {
  text: string;
  onTextChange: (value: string) => void;
  voices: SpeechSynthesisVoice[];
  voiceURI: string;
  onVoiceChange: (value: string) => void;
  rate: number;
  onRateChange: (value: number) => void;
  pitch: number;
  onPitchChange: (value: number) => void;
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isSupported: boolean;
};

export default function TTSInputPanel({
  text,
  onTextChange,
  voices,
  voiceURI,
  onVoiceChange,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  playbackState,
  onPlay,
  onPause,
  onResume,
  onStop,
  isSupported,
}: Props) {
  const t = useTranslations("tools.text-to-speech.form");

  return (
    <SectionCard title={t("inputTitle")}>
      {!isSupported && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {t("unsupported")}
        </p>
      )}

      <label className="block space-y-2">
        <span className="sr-only">{t("textLabel")}</span>
        <textarea
          dir="auto"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t("textPlaceholder")}
          rows={8}
          className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>

      {voices.length > 0 && (
        <label className="mt-4 block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("voiceLabel")}</span>
          <select
            value={voiceURI}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("rateLabel")}</span>
          <span dir="ltr" className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {rate.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={rate}
          onChange={(e) => onRateChange(Number(e.target.value))}
          className="mt-2 w-full accent-blue-600"
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("pitchLabel")}</span>
          <span dir="ltr" className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {pitch.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={pitch}
          onChange={(e) => onPitchChange(Number(e.target.value))}
          className="mt-2 w-full accent-blue-600"
        />
      </div>

      <div className="mt-5 flex gap-2">
        {playbackState === "idle" && (
          <button
            type="button"
            onClick={onPlay}
            disabled={!isSupported || !text.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={18} />
            {t("speak")}
          </button>
        )}
        {playbackState === "speaking" && (
          <button
            type="button"
            onClick={onPause}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Pause size={18} />
            {t("pause")}
          </button>
        )}
        {playbackState === "paused" && (
          <button
            type="button"
            onClick={onResume}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Play size={18} />
            {t("resume")}
          </button>
        )}
        <button
          type="button"
          onClick={onStop}
          disabled={playbackState === "idle"}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Square size={16} />
          {t("stop")}
        </button>
      </div>
    </SectionCard>
  );
}
