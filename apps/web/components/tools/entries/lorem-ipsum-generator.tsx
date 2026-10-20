import LoremEducation from "@/components/tools/lorem-ipsum-generator/LoremEducation";
import LoremIpsumGenerator from "@/components/tools/lorem-ipsum-generator/LoremIpsumGenerator";

export default function ToolEntry() {
  return <LoremIpsumGenerator education={<LoremEducation />} />;
}
