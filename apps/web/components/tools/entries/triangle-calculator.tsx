import TriangleCalculator from "@/components/tools/triangle-calculator/TriangleCalculator";
import TriangleEducation from "@/components/tools/triangle-calculator/TriangleEducation";

export default function ToolEntry() {
  return <TriangleCalculator education={<TriangleEducation />} />;
}
