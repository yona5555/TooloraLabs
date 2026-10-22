import RetirementCalculator from "@/components/tools/retirement-calculator/RetirementCalculator";
import RetirementEducation from "@/components/tools/retirement-calculator/RetirementEducation";

export default function ToolEntry() {
  return <RetirementCalculator education={<RetirementEducation />} />;
}
