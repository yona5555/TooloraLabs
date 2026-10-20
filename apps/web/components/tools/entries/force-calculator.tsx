import ForceCalculator from "@/components/tools/force-calculator/ForceCalculator";
import ForceEducation from "@/components/tools/force-calculator/ForceEducation";

export default function ToolEntry() {
  return <ForceCalculator education={<ForceEducation />} />;
}
