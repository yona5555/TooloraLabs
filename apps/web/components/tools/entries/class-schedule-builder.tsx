import ClassScheduleBuilder from "@/components/tools/class-schedule-builder/ClassScheduleBuilder";
import ClassScheduleEducation from "@/components/tools/class-schedule-builder/ClassScheduleEducation";

export default function ToolEntry() {
  return <ClassScheduleBuilder education={<ClassScheduleEducation />} />;
}
