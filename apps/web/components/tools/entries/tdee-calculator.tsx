import TDEECalculator from "@/components/tools/tdee-calculator/TDEECalculator";
import TDEEEducation from "@/components/tools/tdee-calculator/TDEEEducation";

export default function ToolEntry() {
  return <TDEECalculator education={<TDEEEducation />} />;
}
