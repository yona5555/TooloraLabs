import MTEducation from "@/components/tools/multiplication-table-generator/MTEducation";
import MultiplicationTableGenerator from "@/components/tools/multiplication-table-generator/MultiplicationTableGenerator";

export default function ToolEntry() {
  return <MultiplicationTableGenerator education={<MTEducation />} />;
}
