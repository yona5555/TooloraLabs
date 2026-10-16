/**
 * Real English passages for the readability tool. The formulas are calibrated for English only (the
 * tool's own copy says so), so the instant-result sample stays English on every locale's page.
 */
export const SAMPLE_TEXT = `Good writing is easy to read. Short sentences help readers keep their place, and familiar words let them move quickly from one idea to the next.

Researchers have measured readability for decades. In 1948, Rudolf Flesch proposed a formula that combines average sentence length with the average number of syllables per word. Insurance regulators, government agencies and newspapers still check their documents against minimum scores. Unnecessarily complicated terminology, however, can dramatically reduce comprehension for everyday audiences!

Try it yourself. Paste your own draft, click a sentence in the chart below, or mark the hard words to see exactly what pulls your score down.`;

/**
 * Four passages spanning the readability scale, shared by the input panel's scenario chips and the
 * Reading Ease scale indicator (reference markers), so both always show the same scores.
 */
export type PassageExampleKey = "childrensBook" | "everydayEmail" | "legalContract" | "academicPaper";

export type PassageExample = {
  key: PassageExampleKey;
  text: string;
};

export const PASSAGE_EXAMPLES: PassageExample[] = [
  {
    key: "childrensBook",
    text: "The sun is up. Birds sing in the tall trees. A small dog runs across the green grass. It is a good day to play outside.",
  },
  {
    key: "everydayEmail",
    text: "Our team meets every Monday morning to review last week's progress and plan the tasks ahead. This helps everyone stay on track and catch small problems before they become bigger ones.",
  },
  {
    key: "legalContract",
    text: "The undersigned parties hereby acknowledge and agree that the aforementioned provisions shall remain in full force and effect notwithstanding any subsequent amendment absent explicit written consent from all signatories hereto.",
  },
  {
    key: "academicPaper",
    text: "The epistemological ramifications of poststructuralist discourse analysis necessitate a fundamental reconceptualization of hermeneutic methodologies within contemporary sociolinguistic paradigms of institutional knowledge production.",
  },
];
