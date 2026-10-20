import WorldTimeCalculator from "@/components/tools/world-time-converter/WorldTimeCalculator";
import WorldTimeEducation from "@/components/tools/world-time-converter/WorldTimeEducation";

export default function ToolEntry() {
  return <WorldTimeCalculator education={<WorldTimeEducation />} />;
}
