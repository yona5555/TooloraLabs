import VolumeCalculator from "@/components/tools/volume-calculator/VolumeCalculator";
import VolumeEducation from "@/components/tools/volume-calculator/VolumeEducation";

export default function ToolEntry() {
  return <VolumeCalculator education={<VolumeEducation />} />;
}
