import PasswordEducation from "@/components/tools/password-generator/PasswordEducation";
import PasswordGeneratorTool from "@/components/tools/password-generator/PasswordGeneratorTool";

export default function ToolEntry() {
  return <PasswordGeneratorTool education={<PasswordEducation />} />;
}
