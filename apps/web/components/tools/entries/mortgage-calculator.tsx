import MortgageCalculator from "@/components/tools/mortgage-calculator/MortgageCalculator";
import MortgageEducation from "@/components/tools/mortgage-calculator/MortgageEducation";

export default function ToolEntry() {
  return <MortgageCalculator education={<MortgageEducation />} />;
}
