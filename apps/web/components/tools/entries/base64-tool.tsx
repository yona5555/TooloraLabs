import Base64Education from "@/components/tools/base64-tool/Base64Education";
import Base64ToolUI from "@/components/tools/base64-tool/Base64ToolUI";

export default function ToolEntry() {
  return <Base64ToolUI education={<Base64Education />} />;
}
