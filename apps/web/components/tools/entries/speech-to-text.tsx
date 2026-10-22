import STTEducation from "@/components/tools/speech-to-text/STTEducation";
import SpeechToText from "@/components/tools/speech-to-text/SpeechToText";

export default function ToolEntry() {
  return <SpeechToText education={<STTEducation />} />;
}
