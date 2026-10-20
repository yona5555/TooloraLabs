import BodyFatCalculator from "@/components/tools/body-fat-calculator/BodyFatCalculator";
import BodyFatEducation from "@/components/tools/body-fat-calculator/BodyFatEducation";

export default function ToolEntry() {
  return <BodyFatCalculator education={<BodyFatEducation />} />;
}
