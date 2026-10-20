import ScientificCalculator from "@/components/tools/scientific-calculator/ScientificCalculator";
import ScientificEducation from "@/components/tools/scientific-calculator/ScientificEducation";

export default function ToolEntry() {
  return <ScientificCalculator education={<ScientificEducation />} />;
}
