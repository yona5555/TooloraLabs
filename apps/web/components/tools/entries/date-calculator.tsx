import DateCalculator from "@/components/tools/date-calculator/DateCalculator";
import DateEducation from "@/components/tools/date-calculator/DateEducation";
import { RenderClockProvider } from "@/components/tools/markets/RenderClock";
import { renderTime } from "@/lib/render-time";

export default function ToolEntry() {
  return (
    <RenderClockProvider renderedAt={renderTime()}>
      <DateCalculator education={<DateEducation />} />
    </RenderClockProvider>
  );
}
