import StudyTimeCalculator from "@/components/tools/study-time-calculator/StudyTimeCalculator";
import StudyTimeEducation from "@/components/tools/study-time-calculator/StudyTimeEducation";
import { RenderClockProvider } from "@/components/tools/markets/RenderClock";
import { renderTime } from "@/lib/render-time";

export default function ToolEntry() {
  return (
    <RenderClockProvider renderedAt={renderTime()}>
      <StudyTimeCalculator education={<StudyTimeEducation />} />
    </RenderClockProvider>
  );
}
