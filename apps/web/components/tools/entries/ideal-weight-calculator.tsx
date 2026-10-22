import IdealWeightCalculator from "@/components/tools/ideal-weight-calculator/IdealWeightCalculator";
import IdealWeightEducation from "@/components/tools/ideal-weight-calculator/IdealWeightEducation";

export default function ToolEntry() {
  return <IdealWeightCalculator education={<IdealWeightEducation />} />;
}
