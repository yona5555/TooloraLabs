import CitationEducation from "@/components/tools/citation-generator/CitationEducation";
import CitationGenerator from "@/components/tools/citation-generator/CitationGenerator";

export default function ToolEntry() {
  return <CitationGenerator education={<CitationEducation />} />;
}
