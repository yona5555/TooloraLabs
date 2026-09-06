import { useTranslations } from "next-intl";
import { Mic } from "lucide-react";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { SpeechToTextOutput, ListeningState } from "./types";

type Props = {
  result: SpeechToTextOutput;
  interimText: string;
  listeningState: ListeningState;
};

export default function STTResult({ result, interimText, listeningState }: Props) {
  const t = useTranslations("tools.speech-to-text.result");

  const statusKey = listeningState === "listening" ? "listening" : listeningState === "denied" ? "denied" : "idle";

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        {result.transcript && <CopyButton text={result.transcript} className="!text-white dark:!text-white" />}
      </div>
      <div className="p-4 lg:p-6">
        <div className="mb-4 flex items-center justify-center gap-2">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
              listeningState === "listening"
                ? "animate-pulse border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
            }`}
          >
            <Mic size={20} />
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t(`status.${statusKey}`)}</p>
        </div>

        <div
          dir="auto"
          className="min-h-32 rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-100"
        >
          {result.transcript || interimText ? (
            <>
              {result.transcript}
              {interimText && <span className="text-zinc-400 dark:text-zinc-500"> {interimText}</span>}
            </>
          ) : (
            <span className="text-zinc-400 dark:text-zinc-500">{t("emptyTranscript")}</span>
          )}
        </div>

        {result.transcript && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400">{t("wordCountLabel")}</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.wordCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
