import FileSizeConverterTool from "@/components/tools/file-size-converter/FileSizeConverterTool";
import FileSizeEducation from "@/components/tools/file-size-converter/FileSizeEducation";

export default function ToolEntry() {
  return <FileSizeConverterTool education={<FileSizeEducation />} />;
}
