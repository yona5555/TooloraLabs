import StudyTimeCalculator from "@/components/tools/study-time-calculator/StudyTimeCalculator";
import StudyTimeEducation from "@/components/tools/study-time-calculator/StudyTimeEducation";

export default function ToolEntry() {
  return <StudyTimeCalculator education={<StudyTimeEducation />} />;
}
