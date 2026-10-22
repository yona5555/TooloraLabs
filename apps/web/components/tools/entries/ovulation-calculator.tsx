import OvulationCalculator from "@/components/tools/ovulation-calculator/OvulationCalculator";
import OvulationEducation from "@/components/tools/ovulation-calculator/OvulationEducation";

export default function ToolEntry() {
  return <OvulationCalculator education={<OvulationEducation />} />;
}
