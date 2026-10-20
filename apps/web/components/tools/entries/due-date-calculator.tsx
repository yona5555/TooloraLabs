import DueDateCalculator from "@/components/tools/due-date-calculator/DueDateCalculator";
import DueDateEducation from "@/components/tools/due-date-calculator/DueDateEducation";

export default function ToolEntry() {
  return <DueDateCalculator education={<DueDateEducation />} />;
}
