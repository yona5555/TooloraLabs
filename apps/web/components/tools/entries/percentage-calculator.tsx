import PercentageCalculator from "@/components/tools/percentage-calculator/PercentageCalculator";
import PercentageEducation from "@/components/tools/percentage-calculator/PercentageEducation";

export default function ToolEntry() {
  return <PercentageCalculator education={<PercentageEducation />} />;
}
