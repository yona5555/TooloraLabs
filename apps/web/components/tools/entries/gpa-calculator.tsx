import GpaCalculator from "@/components/tools/gpa-calculator/GpaCalculator";
import GpaEducation from "@/components/tools/gpa-calculator/GpaEducation";

export default function ToolEntry() {
  return <GpaCalculator education={<GpaEducation />} />;
}
