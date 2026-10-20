import MacroCalculator from "@/components/tools/macro-calculator/MacroCalculator";
import MacroEducation from "@/components/tools/macro-calculator/MacroEducation";

export default function ToolEntry() {
  return <MacroCalculator education={<MacroEducation />} />;
}
