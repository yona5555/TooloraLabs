import JSONEducation from "@/components/tools/json-formatter/JSONEducation";
import JSONFormatterTool from "@/components/tools/json-formatter/JSONFormatterTool";

export default function ToolEntry() {
  return <JSONFormatterTool education={<JSONEducation />} />;
}
