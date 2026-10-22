import StatisticsCalculator from "@/components/tools/statistics-calculator/StatisticsCalculator";
import StatisticsEducation from "@/components/tools/statistics-calculator/StatisticsEducation";

export default function ToolEntry() {
  return <StatisticsCalculator education={<StatisticsEducation />} />;
}
