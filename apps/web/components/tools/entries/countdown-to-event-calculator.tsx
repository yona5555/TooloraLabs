import CountdownEducation from "@/components/tools/countdown-to-event-calculator/CountdownEducation";
import CountdownToEventCalculator from "@/components/tools/countdown-to-event-calculator/CountdownToEventCalculator";

export default function ToolEntry() {
  return <CountdownToEventCalculator education={<CountdownEducation />} />;
}
