import PhCalculator from "@/components/tools/ph-calculator/PhCalculator";
import PhEducation from "@/components/tools/ph-calculator/PhEducation";

export default function ToolEntry() {
  return <PhCalculator education={<PhEducation />} />;
}
