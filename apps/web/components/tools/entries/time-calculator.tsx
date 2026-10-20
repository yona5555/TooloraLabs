import TimeCalculator from "@/components/tools/time-calculator/TimeCalculator";
import TimeEducation from "@/components/tools/time-calculator/TimeEducation";

export default function ToolEntry() {
  return <TimeCalculator education={<TimeEducation />} />;
}
