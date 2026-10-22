import DuplicateLineEducation from "@/components/tools/duplicate-line-remover/DuplicateLineEducation";
import DuplicateLineRemoverTool from "@/components/tools/duplicate-line-remover/DuplicateLineRemoverTool";

export default function ToolEntry() {
  return <DuplicateLineRemoverTool education={<DuplicateLineEducation />} />;
}
