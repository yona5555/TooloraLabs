"use client";
import { Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { TextToSpeechOutput, PlaybackState } from "./types";
import TTSShareExportModal from "./TTSShareExportModal";
import TTSScene from "./TTSScene";
import { fmtTime, seconds, wordCount } from "./ttsMath";

type Props = {
  result: TextToSpeechOutput;
  /** The tool's chunks for the text in the field, or for the stored sample while the field is empty. */
  plan: TextToSpeechOutput;
  isExample: boolean;
  playbackState: PlaybackState;
  rate: number;
  pitch: number;
  onRateChange: (v: number) => void;
};

/**
 * §44 (2D): the Playback card carries the speech-queue timeline at its top, then the playback
 * status and the result values, all inside this one card.
 */
export default function TTSResult({ result, plan, isExample, playbackState, rate, pitch, onRateChange }: Props) {
  const t = useTranslations("tools.text-to-speech.result");
  const tRoot = useTranslations("tools.text-to-speech");
  const tv = useTranslations("tools.text-to-speech.visuals.hero");
  const tc = useTranslations("toolPage.indicatorKit");

  const statusKey = playbackState === "speaking" ? "speaking" : playbackState === "paused" ? "paused" : "idle";
  const hasResult = result.error === null && result.chunks.length > 0;
  const words = plan.chunks.reduce((a, c) => a + wordCount(c), 0);
  const rows = [
    { k: "chars", label: t("characterCountLabel"), value: plan.characterCount.toLocaleString("en-US") },
    { k: "chunks", label: t("chunkCountLabel"), value: String(plan.chunks.length) },
    { k: "words", label: tv("words"), value: words.toLocaleString("en-US") },
    { k: "time", label: tv("time"), value: `≈ ${fmtTime(seconds(words, rate))}` },
    { k: "rate", label: tRoot("form.rateLabel"), value: `${rate.toFixed(1)}×` },
    { k: "pitch", label: tRoot("form.pitchLabel"), value: pitch.toFixed(1) },
  ];

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard phoneRole="output"
        id="tts-result"
        title={t("heading")}
        className="flex flex-col lg:flex-1"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {hasResult && (
              <TTSShareExportModal
                inputRows={[
                  { label: tRoot("shareExport.rateLabel"), value: `${rate}x` },
                  { label: tRoot("shareExport.pitchLabel"), value: String(pitch) },
                ]}
                resultRows={[
                  { label: t("characterCountLabel"), value: String(result.characterCount) },
                  { label: t("chunkCountLabel"), value: String(result.chunks.length) },
                ]}
                heroLabel={t("characterCountLabel")}
                heroValue={String(result.characterCount)}
                sentence={tRoot("shareExport.sentence", { characters: result.characterCount, rate, pitch })}
              />
            )}
          </span>
        }
      >
        <TTSScene chunks={plan.chunks} rate={rate} onRate={onRateChange} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />

        <div data-ph-result-values className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2">
            {isExample && (
              <span data-testid="tts-example" className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: "var(--ai-soft)", color: "var(--ph-ink)" }}>
                {tRoot("visuals.example")}
              </span>
            )}
            <p className="text-center text-sm font-semibold" style={{ color: playbackState === "speaking" ? "var(--ai-a)" : "var(--ph-ink)" }}>
              {t(`status.${statusKey}`)}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-1.5 text-sm" data-testid="tts-values">
            {rows.map((r) => (
              <div key={r.k} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2" style={{ background: "var(--glass-table-wrap-bg)" }}>
                <dt style={{ color: "var(--ph-ink-muted)" }}>{r.label}</dt>
                <dd dir="ltr" className="m-0 whitespace-nowrap font-bold tabular-nums" style={{ color: "var(--ph-ink)" }}>
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-center text-xs" style={{ color: "var(--ph-ink-muted)" }}>
            {tv("assumption")}
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
