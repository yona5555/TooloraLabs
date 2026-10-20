import FractionCalculator from "@/components/tools/fraction-calculator/FractionCalculator";
import FractionEducation from "@/components/tools/fraction-calculator/FractionEducation";

export default function ToolEntry() {
  return <FractionCalculator education={<FractionEducation />} />;
}
