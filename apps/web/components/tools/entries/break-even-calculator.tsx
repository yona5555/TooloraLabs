import BreakEvenCalculatorTool from "@/components/tools/break-even-calculator/BreakEvenCalculatorTool";
import BreakEvenEducation from "@/components/tools/break-even-calculator/BreakEvenEducation";

export default function ToolEntry() {
  return <BreakEvenCalculatorTool education={<BreakEvenEducation />} />;
}
