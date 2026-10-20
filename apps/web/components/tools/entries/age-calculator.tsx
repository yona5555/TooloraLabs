import AgeCalculator from "@/components/tools/age-calculator/AgeCalculator";
import AgeEducation from "@/components/tools/age-calculator/AgeEducation";

export default function ToolEntry() {
  return <AgeCalculator education={<AgeEducation />} />;
}
