import LoanCalculator from "@/components/tools/loan-calculator/LoanCalculator";
import LoanEducation from "@/components/tools/loan-calculator/LoanEducation";

export default function ToolEntry() {
  return <LoanCalculator education={<LoanEducation />} />;
}
