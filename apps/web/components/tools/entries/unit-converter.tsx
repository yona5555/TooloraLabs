import UnitConverterTool from "@/components/tools/unit-converter/UnitConverterTool";
import UnitEducation from "@/components/tools/unit-converter/UnitEducation";

export default function ToolEntry() {
  return <UnitConverterTool education={<UnitEducation />} />;
}
