import OhmsLawCalculator from "@/components/tools/ohms-law-calculator/OhmsLawCalculator";
import OhmsLawEducation from "@/components/tools/ohms-law-calculator/OhmsLawEducation";

export default function ToolEntry() {
  return <OhmsLawCalculator education={<OhmsLawEducation />} />;
}
