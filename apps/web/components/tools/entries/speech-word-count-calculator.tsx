import SWEducation from "@/components/tools/speech-word-count-calculator/SWEducation";
import SpeechWordCountCalculator from "@/components/tools/speech-word-count-calculator/SpeechWordCountCalculator";

export default function ToolEntry() {
  return <SpeechWordCountCalculator education={<SWEducation />} />;
}
