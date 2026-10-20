import BMRCalculator from "@/components/tools/bmr-calculator/BMRCalculator";
import BMREducation from "@/components/tools/bmr-calculator/BMREducation";

export default function ToolEntry() {
  return <BMRCalculator education={<BMREducation />} />;
}
