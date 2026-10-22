import FuelCostCalculator from "@/components/tools/fuel-cost-calculator/FuelCostCalculator";
import FuelEducation from "@/components/tools/fuel-cost-calculator/FuelEducation";

export default function ToolEntry() {
  return <FuelCostCalculator education={<FuelEducation />} />;
}
