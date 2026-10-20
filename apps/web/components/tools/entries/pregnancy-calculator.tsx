import PregnancyCalculator from "@/components/tools/pregnancy-calculator/PregnancyCalculator";
import PregnancyEducation from "@/components/tools/pregnancy-calculator/PregnancyEducation";

export default function ToolEntry() {
  return <PregnancyCalculator education={<PregnancyEducation />} />;
}
