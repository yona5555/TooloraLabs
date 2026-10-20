import SignificantFiguresCalculator from "@/components/tools/significant-figures-calculator/SignificantFiguresCalculator";
import SignificantFiguresEducation from "@/components/tools/significant-figures-calculator/SignificantFiguresEducation";

export default function ToolEntry() {
  return <SignificantFiguresCalculator education={<SignificantFiguresEducation />} />;
}
