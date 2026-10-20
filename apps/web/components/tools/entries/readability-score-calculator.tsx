import ReadabilityCalculator from "@/components/tools/readability-score-calculator/ReadabilityCalculator";
import ReadabilityEducation from "@/components/tools/readability-score-calculator/ReadabilityEducation";

export default function ToolEntry() {
  return <ReadabilityCalculator education={<ReadabilityEducation />} />;
}
