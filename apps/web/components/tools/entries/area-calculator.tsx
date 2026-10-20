import AreaCalculator from "@/components/tools/area-calculator/AreaCalculator";
import AreaEducation from "@/components/tools/area-calculator/AreaEducation";

export default function ToolEntry() {
  return <AreaCalculator education={<AreaEducation />} />;
}
