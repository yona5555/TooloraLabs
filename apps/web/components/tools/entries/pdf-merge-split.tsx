import PdfMergeSplitEducation from "@/components/tools/pdf-merge-split/PdfMergeSplitEducation";
import PdfMergeSplitTool from "@/components/tools/pdf-merge-split/PdfMergeSplitTool";

export default function ToolEntry() {
  return <PdfMergeSplitTool education={<PdfMergeSplitEducation />} />;
}
