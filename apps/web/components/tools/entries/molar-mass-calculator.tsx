import MolarMassCalculator from "@/components/tools/molar-mass-calculator/MolarMassCalculator";
import MolarMassEducation from "@/components/tools/molar-mass-calculator/MolarMassEducation";

export default function ToolEntry() {
  return <MolarMassCalculator education={<MolarMassEducation />} />;
}
