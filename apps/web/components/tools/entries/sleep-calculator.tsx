import SleepCalculator from "@/components/tools/sleep-calculator/SleepCalculator";
import SleepEducation from "@/components/tools/sleep-calculator/SleepEducation";

export default function ToolEntry() {
  return <SleepCalculator education={<SleepEducation />} />;
}
