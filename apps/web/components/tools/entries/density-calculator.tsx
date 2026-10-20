import DensityCalculator from "@/components/tools/density-calculator/DensityCalculator";
import DensityEducation from "@/components/tools/density-calculator/DensityEducation";

export default function ToolEntry() {
  return <DensityCalculator education={<DensityEducation />} />;
}
