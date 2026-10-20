import StoichiometryCalculator from "@/components/tools/stoichiometry-calculator/StoichiometryCalculator";
import StoichiometryEducation from "@/components/tools/stoichiometry-calculator/StoichiometryEducation";

export default function ToolEntry() {
  return <StoichiometryCalculator education={<StoichiometryEducation />} />;
}
