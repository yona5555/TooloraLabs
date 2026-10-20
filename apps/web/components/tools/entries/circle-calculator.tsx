import CircleCalculator from "@/components/tools/circle-calculator/CircleCalculator";
import CircleEducation from "@/components/tools/circle-calculator/CircleEducation";

export default function ToolEntry() {
  return <CircleCalculator education={<CircleEducation />} />;
}
