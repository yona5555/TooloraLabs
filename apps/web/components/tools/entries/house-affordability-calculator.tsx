import HouseAffordabilityCalculator from "@/components/tools/house-affordability-calculator/HouseAffordabilityCalculator";
import HouseAffordabilityEducation from "@/components/tools/house-affordability-calculator/HouseAffordabilityEducation";

export default function ToolEntry() {
  return <HouseAffordabilityCalculator education={<HouseAffordabilityEducation />} />;
}
