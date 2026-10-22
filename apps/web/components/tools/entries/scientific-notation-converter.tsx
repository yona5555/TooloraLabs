import ScientificNotationConverter from "@/components/tools/scientific-notation-converter/ScientificNotationConverter";
import ScientificNotationEducation from "@/components/tools/scientific-notation-converter/ScientificNotationEducation";

export default function ToolEntry() {
  return <ScientificNotationConverter education={<ScientificNotationEducation />} />;
}
