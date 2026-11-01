import InvoiceEducation from "@/components/tools/invoice-generator/InvoiceEducation";
import InvoiceGeneratorTool from "@/components/tools/invoice-generator/InvoiceGeneratorTool";
import { RenderClockProvider } from "@/components/tools/markets/RenderClock";
import { renderTime } from "@/lib/render-time";

export default function ToolEntry() {
  return (
    <RenderClockProvider renderedAt={renderTime()}>
      <InvoiceGeneratorTool education={<InvoiceEducation />} />
    </RenderClockProvider>
  );
}
