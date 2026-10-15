"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SpeechToTextCalculator as STTTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
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
import { EXAMPLE_SEGMENTS } from "./sttMath";

const tool = new STTTool();

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

  // How many final segments the tool joins (the Transcript visual's handle); null = all of them.
  const [included, setIncluded] = useState<number | null>(null);
  // While nothing has been recognised yet, the card shows the labelled stored example.
  const isExample = segments.length === 0;
  const source = isExample ? EXAMPLE_SEGMENTS : segments;
  const k = Math.min(included ?? source.length, source.length);

  const result = useMemo(() => {
    const output = tool.execute({ segments: source.slice(0, k) }, { locale: "en-US" });
    return output.data;
  }, [source, k]);

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
          setIncluded(null);
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
    setIncluded(null);
    setInterimText("");
  }

  const [navSentinelRef, navBarVisible] = useNavBarVisible();
  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <GlassPage>
      {/* Inter everywhere on this page; drag-handle rims use the shared line token so they keep ≥3:1 in light mode. */}
      <div data-kit-page style={{ fontFamily: "var(--glass-font)", ["--glass-handle-border" as string]: "var(--ph-line)" } as CSSProperties}>
      <div ref={navSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          tight
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-4 lg:h-full">
            <STTControlPanel
              listeningState={listeningState}
              onStart={handleStart}
              onStop={handleStop}
              onClear={handleClear}
              isSupported={isSupported}
              language={language}
              onLanguageChange={setLanguage}
              segments={source}
              isExample={isExample}
            />
              {/* Desktop: under the input card (keeps the columns flush). Phone: after the Transcript card. */}
              <div className="hidden lg:block">
                <STTQuickReference />
              </div>
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <STTResult result={result} interimText={interimText} listeningState={listeningState} segments={source} k={k} onK={setIncluded} isExample={isExample} />
              <div className="lg:hidden">
                <STTQuickReference />
              </div>
            </div>
          }
          sidebar={<RelatedToolsSidebar fill currentSlug="speech-to-text" category="ai-tools" />}
          secondary={
            <div className="flex flex-col gap-4">
              <ViewDocsLink slug="speech-to-text" />
              <SectionNav items={navItems} visible={navBarVisible} />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
