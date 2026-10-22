"use client";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { check } from "@/components/tools/spelling-grammar-checker/sgMath";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The AI section's indicators, all read or computed in the browser with no request: the speech
 * voices this browser offers (speechSynthesis.getVoices(), refreshed on voiceschanged) and their
 * languages, whether it supports speech recognition, the Web Speech rate range the TTS tool
 * enforces, and the spelling checker's own count on a fixed sample. The server snapshot is null, so
 * browser-only values never render on the server. Unsupported APIs hide their indicator.
 */

const SAMPLE = "i recieve teh letter yesterday.";
const SAMPLE_ISSUES = check(SAMPLE)?.issues.length ?? 0;

type Speech = { voices: number; languages: number; synthesis: boolean; recognition: boolean };
let cached: Speech | null = null;

function read(): Speech {
  const synthesis = "speechSynthesis" in window;
  const list = synthesis ? window.speechSynthesis.getVoices() : [];
  const recognition = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  const next = { voices: list.length, languages: new Set(list.map((v) => v.lang.split(/[-_]/)[0])).size, synthesis, recognition };
  if (!cached || cached.voices !== next.voices || cached.languages !== next.languages) cached = next;
  return cached;
}
function subscribe(cb: () => void) {
  if (!("speechSynthesis" in window)) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", cb);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", cb);
}

export default function AiPulse() {
  const t = useTranslations("categoryPulse.ai");
  const speech = useSyncExternalStore(subscribe, read, () => null);
  const ltr = (s: string) => <span dir="ltr">{s}</span>;
  const tts = "/tools/text-to-speech";

  const items: IndicatorItem[] = [];
  if (speech === null) {
    for (const id of ["voices", "languages", "recognition", "rate", "checker"]) items.push({ id, href: tts, label: " ", value: " " });
    return <IndicatorStrip label={t("label")} items={items} />;
  }
  if (speech.synthesis && speech.voices > 0) {
    items.push({ id: "voices", href: tts, label: t("voices"), value: t("voicesValue", { count: speech.voices }), note: t("voicesNote") });
    items.push({ id: "languages", href: tts, label: t("languages"), value: t("languagesValue", { count: speech.languages }), note: t("languagesNote") });
  }
  items.push({
    id: "recognition",
    href: "/tools/speech-to-text",
    label: t("recognition"),
    value: speech.recognition ? t("supported") : t("unsupported"),
    note: t("recognitionNote"),
  });
  if (speech.synthesis) {
    items.push({ id: "rate", href: tts, label: t("rate"), value: ltr("0.1× – 10×"), note: t("rateNote") });
  }
  items.push({
    id: "checker",
    href: "/tools/spelling-grammar-checker",
    label: t("checker"),
    value: t("checkerValue", { count: SAMPLE_ISSUES }),
    note: t("checkerNote", { sample: SAMPLE }),
  });
  return <IndicatorStrip label={t("label")} items={items} />;
}
