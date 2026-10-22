import GasLawEducation from "@/components/tools/ideal-gas-law-calculator/GasLawEducation";
import IdealGasLawCalculator from "@/components/tools/ideal-gas-law-calculator/IdealGasLawCalculator";

export default function ToolEntry() {
  return <IdealGasLawCalculator education={<GasLawEducation />} />;
}
