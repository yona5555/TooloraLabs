import LogoEducation from "@/components/tools/text-logo-generator/LogoEducation";
import TextLogoGenerator from "@/components/tools/text-logo-generator/TextLogoGenerator";

export default function ToolEntry() {
  return <TextLogoGenerator education={<LogoEducation />} />;
}
