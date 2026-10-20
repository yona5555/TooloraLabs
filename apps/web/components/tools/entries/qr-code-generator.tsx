import QRCodeGeneratorTool from "@/components/tools/qr-code-generator/QRCodeGeneratorTool";
import QREducation from "@/components/tools/qr-code-generator/QREducation";

export default function ToolEntry() {
  return <QRCodeGeneratorTool education={<QREducation />} />;
}
