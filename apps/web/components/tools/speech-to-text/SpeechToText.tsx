"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SpeechToTextCalculator as STTTool, type SpeechToTextOutput } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import STTControlPanel from "./STTControlPanel";
import STTResult from "./STTResult";
import STTQuickReference from "./STTQuickReference";
import {
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
  subscribeSpeechRecognitionSupport,
  getServerSpeechRecognitionSupport,
} from "./speechRecognitionSupport";
import type { ListeningState } from "./types";

const tool = new STTTool();

const EMPTY_RESULT: SpeechToTextOutput = { transcript: "", wordCount: 0 };

export default function SpeechToText({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.speech-to-text.nav");

  const isSupported = useSyncExternalStore(
    subscribeSpeechRecognitionSupport,
    isSpeechRecognitionSupported,
    getServerSpeechRecognitionSupport,
  );

  const [segments, setSegments] = useState<string[]>([]);
  const [interimText, setInterimText] = useState("");
  const [listeningState, setListeningState] = useState<ListeningState>("idle");
  const [language, setLanguage] = useState("en-US");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const result = useMemo(() => {
    if (segments.length === 0) return EMPTY_RESULT;
    const output = tool.execute({ segments }, { locale: "en-US" });
    return output.data;
  }, [segments]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function handleStart() {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0]?.transcript ?? "";
        if (res.isFinal) {
          setSegments((prev) => [...prev, text]);
        } else {
          interim += text;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setListeningState("denied");
      } else {
        setListeningState("error");
      }
    };

    recognition.onend = () => {
      setListeningState((prev) => (prev === "denied" ? prev : "idle"));
      setInterimText("");
    };

    recognitionRef.current = recognition;
    setListeningState("listening");
    recognition.start();
  }

  function handleStop() {
    recognitionRef.current?.stop();
    setListeningState("idle");
    setInterimText("");
  }

  function handleClear() {
    setSegments([]);
    setInterimText("");
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
            <STTControlPanel
              listeningState={listeningState}
              onStart={handleStart}
              onStop={handleStop}
              onClear={handleClear}
              isSupported={isSupported}
              language={language}
              onLanguageChange={setLanguage}
            />
          }
          result={<STTResult result={result} interimText={interimText} listeningState={listeningState} />}
          sidebar={<RelatedToolsSidebar currentSlug="speech-to-text" category="ai-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <STTQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
