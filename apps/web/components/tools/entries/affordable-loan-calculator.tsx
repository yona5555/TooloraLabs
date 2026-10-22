import AffordableLoanCalculator from "@/components/tools/affordable-loan-calculator/AffordableLoanCalculator";
import AffordableLoanEducation from "@/components/tools/affordable-loan-calculator/AffordableLoanEducation";

export default function ToolEntry() {
  return <AffordableLoanCalculator education={<AffordableLoanEducation />} />;
}
