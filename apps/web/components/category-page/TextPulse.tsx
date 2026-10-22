import { getTranslations } from "next-intl/server";
import { READING_SPEED_PRESETS, SPEECH_PACE_PRESETS, countSyllablesInWord, fleschReadingEaseOf } from "@tooloralabs/tools";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The text section's indicators, all from the section's own code: the default ("average" / "normal")
 * presets of the reading-time and speech tools, and the classic English pangram run through the
 * readability tool's syllable counter and Flesch formula and counted letter by letter here. The
 * Lorem ipsum source is a documented fact. No request.
 */
const READING_WPM = READING_SPEED_PRESETS.average;
const SPEAKING_WPM = SPEECH_PACE_PRESETS.normal;
const PANGRAM = "The quick brown fox jumps over the lazy dog";
const WORDS = PANGRAM.split(" ");
const SYLLABLES = WORDS.reduce((sum, w) => sum + countSyllablesInWord(w), 0);
const FLESCH = fleschReadingEaseOf(WORDS.length, SYLLABLES / WORDS.length);
const DISTINCT_LETTERS = new Set(PANGRAM.toLowerCase().replace(/[^a-z]/g, "")).size;

export default async function TextPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.text" });
  const ltr = (s: string) => <span dir="ltr">{s}</span>;

  const items: IndicatorItem[] = [
    { id: "reading", href: "/tools/reading-time-calculator", label: t("reading"), value: ltr(`${READING_WPM} wpm`), note: t("readingNote", { minutes: (1000 / READING_WPM).toFixed(1) }) },
    { id: "speaking", href: "/tools/speech-word-count-calculator", label: t("speaking"), value: ltr(`${SPEAKING_WPM} wpm`), note: t("speakingNote", { words: 5 * SPEAKING_WPM }) },
    { id: "pangram", href: "/tools/word-counter", label: t("pangram"), value: t("pangramValue", { letters: DISTINCT_LETTERS, words: WORDS.length }), note: t("pangramNote") },
    { id: "flesch", href: "/tools/readability-score-calculator", label: t("flesch"), value: ltr(FLESCH.toFixed(1)), note: t("fleschNote", { syllables: SYLLABLES, words: WORDS.length }) },
    { id: "lorem", href: "/tools/lorem-ipsum-generator", label: t("lorem"), value: t("loremValue"), note: t("loremNote") },
  ];
  return <IndicatorStrip label={t("label")} items={items} />;
}
