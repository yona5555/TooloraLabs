import ClassScheduleBuilder from "@/components/tools/class-schedule-builder/ClassScheduleBuilder";
import ClassScheduleEducation from "@/components/tools/class-schedule-builder/ClassScheduleEducation";
import { RenderClockProvider } from "@/components/tools/markets/RenderClock";
import { renderTime } from "@/lib/render-time";

export default function ToolEntry() {
  return (
    <RenderClockProvider renderedAt={renderTime()}>
      <ClassScheduleBuilder education={<ClassScheduleEducation />} />
    </RenderClockProvider>
  );
}
