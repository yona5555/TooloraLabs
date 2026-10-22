import TipCalculator from "@/components/tools/tip-calculator/TipCalculator";
import TipEducation from "@/components/tools/tip-calculator/TipEducation";

export default function ToolEntry() {
  return <TipCalculator education={<TipEducation />} />;
}
