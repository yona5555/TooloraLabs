import ProbabilityCalculator from "@/components/tools/probability-calculator/ProbabilityCalculator";
import ProbabilityEducation from "@/components/tools/probability-calculator/ProbabilityEducation";

export default function ToolEntry() {
  return <ProbabilityCalculator education={<ProbabilityEducation />} />;
}
