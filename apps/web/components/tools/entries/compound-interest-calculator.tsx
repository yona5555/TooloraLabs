import CompoundInterestCalculator from "@/components/tools/compound-interest-calculator/CompoundInterestCalculator";
import CompoundInterestEducation from "@/components/tools/compound-interest-calculator/CompoundInterestEducation";

export default function ToolEntry() {
  return <CompoundInterestCalculator education={<CompoundInterestEducation />} />;
}
