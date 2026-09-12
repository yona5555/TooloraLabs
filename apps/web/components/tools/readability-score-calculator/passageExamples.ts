/**
 * Four real (not decorative) English passages spanning the readability
 * scale, shared between the above-the-fold InputPanel's scenario chips and
 * the encyclopedia section's live "try it" gauge — both fill/score with the
 * exact same text so the two widgets stay consistent with each other.
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
