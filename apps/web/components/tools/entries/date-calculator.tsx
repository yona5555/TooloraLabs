import DateCalculator from "@/components/tools/date-calculator/DateCalculator";
import DateEducation from "@/components/tools/date-calculator/DateEducation";

export default function ToolEntry() {
  return <DateCalculator education={<DateEducation />} />;
}
