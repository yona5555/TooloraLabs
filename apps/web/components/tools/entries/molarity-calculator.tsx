import MolarityCalculator from "@/components/tools/molarity-calculator/MolarityCalculator";
import MolarityEducation from "@/components/tools/molarity-calculator/MolarityEducation";

export default function ToolEntry() {
  return <MolarityCalculator education={<MolarityEducation />} />;
}
