import SGEducation from "@/components/tools/spelling-grammar-checker/SGEducation";
import SpellingGrammarChecker from "@/components/tools/spelling-grammar-checker/SpellingGrammarChecker";

export default function ToolEntry() {
  return <SpellingGrammarChecker education={<SGEducation />} />;
}
