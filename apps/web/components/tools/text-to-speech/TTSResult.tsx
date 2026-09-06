import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import type { TextToSpeechOutput, PlaybackState } from "./types";

type Props = {
  result: TextToSpeechOutput;
  playbackState: PlaybackState;
};

export default function TTSResult({ result, playbackState }: Props) {
  const t = useTranslations("tools.text-to-speech.result");

  const statusKey =
    playbackState === "speaking" ? "speaking" : playbackState === "paused" ? "paused" : "idle";

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
      </div>
      <div className="flex flex-col items-center gap-4 p-4 lg:p-6">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full border-2 ${
            playbackState === "speaking"
              ? "animate-pulse border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
          }`}
        >
          <Volume2 size={32} />
        </div>
        <p className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-200">{t(`status.${statusKey}`)}</p>

        {result.error === null && result.chunks.length > 0 && (
          <ul className="mt-2 w-full space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
            <li className="flex items-center justify-between gap-3">
              <span className="text-zinc-500 dark:text-zinc-400">{t("characterCountLabel")}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.characterCount}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-zinc-500 dark:text-zinc-400">{t("chunkCountLabel")}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.chunks.length}</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
