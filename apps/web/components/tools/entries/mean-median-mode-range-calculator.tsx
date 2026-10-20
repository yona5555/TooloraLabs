import MeanMedianModeRangeCalculator from "@/components/tools/mean-median-mode-range-calculator/MeanMedianModeRangeCalculator";
import MeanMedianModeRangeEducation from "@/components/tools/mean-median-mode-range-calculator/MeanMedianModeRangeEducation";

export default function ToolEntry() {
  return <MeanMedianModeRangeCalculator education={<MeanMedianModeRangeEducation />} />;
}
