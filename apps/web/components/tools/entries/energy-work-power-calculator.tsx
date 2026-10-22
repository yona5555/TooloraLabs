import EnergyEducation from "@/components/tools/energy-work-power-calculator/EnergyEducation";
import EnergyWorkPowerCalculator from "@/components/tools/energy-work-power-calculator/EnergyWorkPowerCalculator";

export default function ToolEntry() {
  return <EnergyWorkPowerCalculator education={<EnergyEducation />} />;
}
