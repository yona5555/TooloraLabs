import MatrixCalculator from "@/components/tools/matrix-calculator/MatrixCalculator";
import MatrixEducation from "@/components/tools/matrix-calculator/MatrixEducation";

export default function ToolEntry() {
  return <MatrixCalculator education={<MatrixEducation />} />;
}
