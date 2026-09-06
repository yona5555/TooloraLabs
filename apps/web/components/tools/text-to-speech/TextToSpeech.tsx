"use client";
import { useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TextToSpeechCalculator as TTSTool, type TextToSpeechOutput } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import TTSInputPanel from "./TTSInputPanel";
import TTSResult from "./TTSResult";
import TTSQuickReference from "./TTSQuickReference";
import {
  isSpeechSynthesisSupported,
  subscribeSpeechSynthesisSupport,
  getServerSpeechSynthesisSupport,
  subscribeToVoices,
  getVoicesSnapshot,
  getServerVoicesSnapshot,
} from "./speechSynthesisSupport";
import type { PlaybackState } from "./types";

const tool = new TTSTool();

const EMPTY_RESULT: TextToSpeechOutput = { error: "empty-text", chunks: [], characterCount: 0 };

export default function TextToSpeech({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.text-to-speech.nav");

  const isSupported = useSyncExternalStore(
    subscribeSpeechSynthesisSupport,
    isSpeechSynthesisSupported,
    getServerSpeechSynthesisSupport,
  );
  const voices = useSyncExternalStore(subscribeToVoices, getVoicesSnapshot, getServerVoicesSnapshot);

  const [text, setText] = useState("");
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [hasSpoken, setHasSpoken] = useState(false);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);

  const result = useMemo(() => {
    if (!hasSpoken) return EMPTY_RESULT;
    const output = tool.execute({ text, rate, pitch }, { locale: "en-US" });
    return output.data;
  }, [text, rate, pitch, hasSpoken]);

  function handlePlay() {
    if (!isSupported) return;
    const output = tool.execute({ text, rate, pitch }, { locale: "en-US" });
    setHasSpoken(true);
    if (output.data.error) return;

    window.speechSynthesis.cancel();
    const selectedVoice = voices.find((v) => v.voiceURI === voiceURI);
    const utterances = output.data.chunks.map((chunk, i) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = rate;
      utterance.pitch = pitch;
      if (selectedVoice) utterance.voice = selectedVoice;
      if (i === output.data.chunks.length - 1) {
        utterance.onend = () => setPlaybackState("idle");
        utterance.onerror = () => setPlaybackState("idle");
      }
      return utterance;
    });
    utteranceQueueRef.current = utterances;
    utterances.forEach((utterance) => window.speechSynthesis.speak(utterance));
    setPlaybackState("speaking");
  }

  function handlePause() {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setPlaybackState("paused");
  }

  function handleResume() {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setPlaybackState("speaking");
  }

  function handleStop() {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setPlaybackState("idle");
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <TTSInputPanel
              text={text}
              onTextChange={setText}
              voices={voices}
              voiceURI={voiceURI || voices[0]?.voiceURI || ""}
              onVoiceChange={setVoiceURI}
              rate={rate}
              onRateChange={setRate}
              pitch={pitch}
              onPitchChange={setPitch}
              playbackState={playbackState}
              onPlay={handlePlay}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              isSupported={isSupported}
            />
          }
          result={<TTSResult result={result} playbackState={playbackState} />}
          sidebar={<RelatedToolsSidebar currentSlug="text-to-speech" category="ai-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <TTSQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
