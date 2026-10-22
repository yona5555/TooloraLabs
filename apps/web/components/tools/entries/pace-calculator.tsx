import PaceCalculator from "@/components/tools/pace-calculator/PaceCalculator";
import PaceEducation from "@/components/tools/pace-calculator/PaceEducation";

export default function ToolEntry() {
  return <PaceCalculator education={<PaceEducation />} />;
}
