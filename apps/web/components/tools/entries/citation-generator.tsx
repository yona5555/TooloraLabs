import CitationEducation from "@/components/tools/citation-generator/CitationEducation";
import CitationGenerator from "@/components/tools/citation-generator/CitationGenerator";
import { RenderClockProvider } from "@/components/tools/markets/RenderClock";
import { renderTime } from "@/lib/render-time";

export default function ToolEntry() {
  return (
    <RenderClockProvider renderedAt={renderTime()}>
      <CitationGenerator education={<CitationEducation />} />
    </RenderClockProvider>
  );
}
