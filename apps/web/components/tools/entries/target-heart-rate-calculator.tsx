import TargetHeartRateCalculator from "@/components/tools/target-heart-rate-calculator/TargetHeartRateCalculator";
import TargetHeartRateEducation from "@/components/tools/target-heart-rate-calculator/TargetHeartRateEducation";

export default function ToolEntry() {
  return <TargetHeartRateCalculator education={<TargetHeartRateEducation />} />;
}
