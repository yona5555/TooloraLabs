import InvoiceEducation from "@/components/tools/invoice-generator/InvoiceEducation";
import InvoiceGeneratorTool from "@/components/tools/invoice-generator/InvoiceGeneratorTool";

export default function ToolEntry() {
  return <InvoiceGeneratorTool education={<InvoiceEducation />} />;
}
