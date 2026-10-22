"use client";
import { Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import CopyButton from "@/components/tool-ui/CopyButton";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { SpeechToTextOutput, ListeningState } from "./types";
import STTShareExportModal from "./STTShareExportModal";
import STTScene from "./STTScene";

type Props = {
  result: SpeechToTextOutput;
  interimText: string;
  listeningState: ListeningState;
  /** Every final segment available (the visitor's, or the stored example while none exist). */
  segments: string[];
  /** How many of them the tool joins (the visual's handle). */
  k: number;
  onK: (v: number) => void;
  isExample: boolean;
};

/**
 * §44 (2D): the Transcript card carries the segment chart at its top, then the listening status,
 * the transcript and its word count, all inside this one card.
 */
export default function STTResult({ result, interimText, listeningState, segments, k, onK, isExample }: Props) {
  const t = useTranslations("tools.speech-to-text.result");
  const tv = useTranslations("tools.speech-to-text.visuals");
  const tc = useTranslations("toolPage.indicatorKit");

  const statusKey = listeningState === "listening" ? "listening" : listeningState === "denied" ? "denied" : "idle";
  const real = !isExample && result.transcript;

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard
        id="stt-result"
        title={t("heading")}
        className="flex flex-col lg:flex-1"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {real && <CopyButton text={result.transcript} className="!text-white dark:!text-white" />}
            {real && (
              <STTShareExportModal
                resultRows={[
                  { label: t("heading"), value: result.transcript },
                  { label: t("wordCountLabel"), value: String(result.wordCount) },
                ]}
                heroLabel={t("wordCountLabel")}
                heroValue={String(result.wordCount)}
                sentence={result.transcript}
              />
            )}
          </span>
        }
      >
        <STTScene segments={segments} k={k} onK={onK} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />

        <div data-ph-result-values className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2">
            {isExample && (
              <span data-testid="stt-example" className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: "var(--ai-soft)", color: "var(--ph-ink)" }}>
                {tv("example")}
              </span>
            )}
            <p className="text-center text-sm font-semibold" style={{ color: listeningState === "listening" ? "var(--ai-d)" : "var(--ph-ink)" }}>
              {t(`status.${statusKey}`)}
            </p>
          </div>
          <div dir="auto" data-testid="stt-transcript" className="rounded-xl p-3 text-sm leading-6" style={{ background: "var(--glass-table-wrap-bg)", color: "var(--ph-ink)" }}>
            {result.transcript}
            {interimText && <span style={{ color: "var(--ph-ink-muted)" }}> {interimText}</span>}
          </div>
          <dl className="grid grid-cols-2 gap-1.5 text-sm">
            {[
              { k: "words", label: t("wordCountLabel"), value: String(result.wordCount) },
              { k: "joined", label: tv("hero.segmentsUsed"), value: `${k} / ${segments.length}` },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2" style={{ background: "var(--glass-table-wrap-bg)" }}>
                <dt style={{ color: "var(--ph-ink-muted)" }}>{r.label}</dt>
                <dd dir="ltr" data-testid={`stt-${r.k}`} className="m-0 whitespace-nowrap font-bold tabular-nums" style={{ color: "var(--ph-ink)" }}>
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </SectionCard>
    </div>
  );
}
