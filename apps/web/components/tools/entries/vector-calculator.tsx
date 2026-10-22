import VectorCalculator from "@/components/tools/vector-calculator/VectorCalculator";
import VectorEducation from "@/components/tools/vector-calculator/VectorEducation";

export default function ToolEntry() {
  return <VectorCalculator education={<VectorEducation />} />;
}
