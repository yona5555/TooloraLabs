import BarcodeEducation from "@/components/tools/barcode-generator/BarcodeEducation";
import BarcodeGeneratorTool from "@/components/tools/barcode-generator/BarcodeGeneratorTool";

export default function ToolEntry() {
  return <BarcodeGeneratorTool education={<BarcodeEducation />} />;
}
