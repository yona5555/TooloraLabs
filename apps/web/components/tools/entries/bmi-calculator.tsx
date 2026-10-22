import BMICalculator from "@/components/tools/bmi-calculator/BMICalculator";
import BMIEducation from "@/components/tools/bmi-calculator/BMIEducation";

export default function ToolEntry() {
  return <BMICalculator education={<BMIEducation />} />;
}
