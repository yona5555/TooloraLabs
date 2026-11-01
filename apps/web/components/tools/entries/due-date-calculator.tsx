import DueDateCalculator from "@/components/tools/due-date-calculator/DueDateCalculator";
import DueDateEducation from "@/components/tools/due-date-calculator/DueDateEducation";
import { RenderClockProvider } from "@/components/tools/markets/RenderClock";
import { renderTime } from "@/lib/render-time";

export default function ToolEntry() {
  return (
    <RenderClockProvider renderedAt={renderTime()}>
      <DueDateCalculator education={<DueDateEducation />} />
    </RenderClockProvider>
  );
}
