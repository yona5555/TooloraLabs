import { describe, it, expect } from "vitest";
import { TextCounter } from "../TextCounter";
import { profileText } from "../textProfile";
import { countWords, normalizeWord, splitSentences, tokenizeWords, wordLength } from "../textSegmentation";
import { ReadingTimeCalculator } from "../../calculators/ReadingTimeCalculator";
import { SpeechWordCountCalculator } from "../../calculators/SpeechWordCountCalculator";

const tool = new TextCounter();
const ctx = { locale: "en-US" };
const count = (text: string) => tool.execute({ text }, ctx).data;

const AR_PLAIN = "كتب الطالب الدرس. هل فهم الدرس؟ نعم فهمه جيدا؛ ثم نام!\n\nالدرس طويل لكن الطالب صبور.";
const AR_VOWELLED =
  "كَتَبَ الطَّالِبُ الدَّرْسَ. هَلْ فَهِمَ الدَّرْسَ؟ نَعَمْ فَهِمَهُ جَيِّدًا؛ ثُمَّ نَامَ!\n\nالدَّرْسُ طَوِيلٌ لَكِنَّ الطَّالِبَ صَبُورٌ.";
const HI = "मैंने हिन्दी में किताब पढ़ी। क्या तुमने पढ़ी? हाँ, मैंने भी पढ़ी।\n\nकिताब बहुत अच्छी थी।";
const EN = "The cat sat on the mat. Did the cat sleep? Yes! It slept for 3.5 hours.\n\nThe mat was warm.";

describe("textSegmentation — Arabic", () => {
  it("never splits a word on harakat, tanween, shadda, sukun or tatweel", () => {
    expect(countWords("كَتَبَ")).toBe(1);
    expect(countWords("جَيِّدًا")).toBe(1);
    expect(countWords("صَبُورٌ")).toBe(1);
    expect(countWords("الدَّرْسَ")).toBe(1);
    expect(countWords("كتـــب")).toBe(1);
    expect(tokenizeWords("هَلْ فَهِمَ").map((t) => t.word)).toEqual(["هَلْ", "فَهِمَ"]);
  });

  it("gives the same counts with and without diacritics", () => {
    const plain = count(AR_PLAIN);
    const vowelled = count(AR_VOWELLED);
    expect(plain.words).toBe(16);
    expect(vowelled.words).toBe(16);
    expect(plain.uniqueWords).toBe(13);
    expect(vowelled.uniqueWords).toBe(13);
    expect(vowelled.averageWordLength).toBe(plain.averageWordLength);
    expect(plain.averageWordLength).toBe(3.9);
  });

  it("ends sentences on ؟ and ؛ as well as . and !", () => {
    expect(count(AR_PLAIN).sentences).toBe(5);
    expect(count(AR_VOWELLED).sentences).toBe(5);
    expect(count("هل أنت بخير؟ نعم").sentences).toBe(2);
  });

  it("counts paragraphs separated by blank lines", () => {
    expect(count(AR_VOWELLED).paragraphs).toBe(2);
  });

  it("treats a vowelled and a plain spelling as one unique word", () => {
    expect(normalizeWord("الدَّرْسَ")).toBe("الدرس");
    expect(count("الدرس الدَّرْسَ الدَّرْسُ").uniqueWords).toBe(1);
    expect(wordLength("الدَّرْسَ")).toBe(5);
  });
});

describe("textSegmentation — Hindi", () => {
  it("never splits a word on matras, virama, nukta or anusvara", () => {
    expect(countWords("हिन्दी")).toBe(1);
    expect(countWords("पढ़ी")).toBe(1);
    expect(countWords("मैंने")).toBe(1);
    expect(tokenizeWords("क्या तुमने").map((t) => t.word)).toEqual(["क्या", "तुमने"]);
  });

  it("counts words, unique words, sentences and paragraphs", () => {
    const out = count(HI);
    expect(out.words).toBe(16);
    expect(out.uniqueWords).toBe(12);
    expect(out.sentences).toBe(4);
    expect(out.paragraphs).toBe(2);
  });

  it("measures word length in letters, not combining marks", () => {
    // ह + न + द (ि ् ी are marks) = 3 letters.
    expect(wordLength("हिन्दी")).toBe(3);
    expect(count(HI).averageWordLength).toBe(2.1);
  });

  it("ends sentences on the danda (।) and double danda (॥)", () => {
    expect(splitSentences("यह पहला है। यह दूसरा है॥ तीसरा").length).toBe(3);
  });
});

describe("textSegmentation — English", () => {
  it("counts words, unique words, average length, sentences and paragraphs", () => {
    const out = count(EN);
    expect(out.words).toBe(20);
    expect(out.uniqueWords).toBe(15);
    expect(out.averageWordLength).toBe(3.2);
    expect(out.sentences).toBe(5);
    expect(out.paragraphs).toBe(2);
  });

  it("keeps decimals, contractions and hyphenated words whole", () => {
    expect(tokenizeWords("It's a well-known 3.5 rule.").map((t) => t.word)).toEqual(["It's", "a", "well-known", "3.5", "rule"]);
    expect(count("Visit example.com today. Then rest.").sentences).toBe(2);
  });

  it("does not count lone punctuation as a word", () => {
    expect(count("Wait — what?").words).toBe(2);
  });

  it("does not let a sentence cross a line break", () => {
    expect(count("A heading\nThe body text.").sentences).toBe(2);
  });
});

describe("every text tool shares the fix", () => {
  it("profileText agrees with TextCounter in all three languages", () => {
    for (const text of [AR_VOWELLED, HI, EN]) {
      const main = count(text);
      const profile = profileText(text);
      expect(profile.sentences.length).toBe(main.sentences);
      expect(profile.paragraphs.length).toBe(main.paragraphs);
      expect(profile.wordLengths.reduce((a, b) => a + b, 0)).toBe(main.words);
      expect(profile.paragraphs.reduce((a, p) => a + p.words, 0)).toBe(main.words);
    }
  });

  it("reading-time and speech-word-count use the same word count", () => {
    const reading = new ReadingTimeCalculator().execute({ text: AR_VOWELLED, wordsPerMinute: 200 }, ctx);
    const speech = new SpeechWordCountCalculator().execute({ text: HI, wordsPerMinute: 130 }, ctx);
    expect(reading.data.wordCount).toBe(16);
    expect(speech.data.wordCount).toBe(16);
  });
});
