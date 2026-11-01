import PregnancyCalculator from "@/components/tools/pregnancy-calculator/PregnancyCalculator";
import PregnancyEducation from "@/components/tools/pregnancy-calculator/PregnancyEducation";
import { RenderClockProvider } from "@/components/tools/markets/RenderClock";
import { renderTime } from "@/lib/render-time";

export default function ToolEntry() {
  return (
    <RenderClockProvider renderedAt={renderTime()}>
      <PregnancyCalculator education={<PregnancyEducation />} />
    </RenderClockProvider>
  );
}
