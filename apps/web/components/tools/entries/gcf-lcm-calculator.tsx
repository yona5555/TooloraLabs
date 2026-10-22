import GcfLcmCalculator from "@/components/tools/gcf-lcm-calculator/GcfLcmCalculator";
import GcfLcmEducation from "@/components/tools/gcf-lcm-calculator/GcfLcmEducation";

export default function ToolEntry() {
  return <GcfLcmCalculator education={<GcfLcmEducation />} />;
}
