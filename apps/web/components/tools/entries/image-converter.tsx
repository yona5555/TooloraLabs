import ImageConverterTool from "@/components/tools/image-converter/ImageConverterTool";
import ImageEducation from "@/components/tools/image-converter/ImageEducation";

export default function ToolEntry() {
  return <ImageConverterTool education={<ImageEducation />} />;
}
