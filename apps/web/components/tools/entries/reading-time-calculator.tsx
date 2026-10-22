import RTEducation from "@/components/tools/reading-time-calculator/RTEducation";
import ReadingTimeCalculator from "@/components/tools/reading-time-calculator/ReadingTimeCalculator";

export default function ToolEntry() {
  return <ReadingTimeCalculator education={<RTEducation />} />;
}
