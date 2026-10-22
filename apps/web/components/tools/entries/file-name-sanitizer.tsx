import FileNameEducation from "@/components/tools/file-name-sanitizer/FileNameEducation";
import FileNameSanitizerTool from "@/components/tools/file-name-sanitizer/FileNameSanitizerTool";

export default function ToolEntry() {
  return <FileNameSanitizerTool education={<FileNameEducation />} />;
}
