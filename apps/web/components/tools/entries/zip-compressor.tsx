import ZipCompressorEducation from "@/components/tools/zip-compressor/ZipCompressorEducation";
import ZipCompressorTool from "@/components/tools/zip-compressor/ZipCompressorTool";

export default function ToolEntry() {
  return <ZipCompressorTool education={<ZipCompressorEducation />} />;
}
