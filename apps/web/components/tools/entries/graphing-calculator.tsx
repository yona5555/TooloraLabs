import GraphingCalculator from "@/components/tools/graphing-calculator/GraphingCalculator";
import GraphingEducation from "@/components/tools/graphing-calculator/GraphingEducation";

export default function ToolEntry() {
  return <GraphingCalculator education={<GraphingEducation />} />;
}
