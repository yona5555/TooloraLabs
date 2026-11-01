import OvulationCalculator from "@/components/tools/ovulation-calculator/OvulationCalculator";
import OvulationEducation from "@/components/tools/ovulation-calculator/OvulationEducation";
import { RenderClockProvider } from "@/components/tools/markets/RenderClock";
import { renderTime } from "@/lib/render-time";

export default function ToolEntry() {
  return (
    <RenderClockProvider renderedAt={renderTime()}>
      <OvulationCalculator education={<OvulationEducation />} />
    </RenderClockProvider>
  );
}
