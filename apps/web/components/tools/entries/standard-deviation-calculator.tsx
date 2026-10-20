import StandardDeviationCalculator from "@/components/tools/standard-deviation-calculator/StandardDeviationCalculator";
import StandardDeviationEducation from "@/components/tools/standard-deviation-calculator/StandardDeviationEducation";

export default function ToolEntry() {
  return <StandardDeviationCalculator education={<StandardDeviationEducation />} />;
}
