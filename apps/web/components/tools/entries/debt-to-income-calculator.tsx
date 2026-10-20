import DebtToIncomeCalculator from "@/components/tools/debt-to-income-calculator/DebtToIncomeCalculator";
import DebtToIncomeEducation from "@/components/tools/debt-to-income-calculator/DebtToIncomeEducation";

export default function ToolEntry() {
  return <DebtToIncomeCalculator education={<DebtToIncomeEducation />} />;
}
