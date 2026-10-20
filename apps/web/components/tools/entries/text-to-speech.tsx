import TTSEducation from "@/components/tools/text-to-speech/TTSEducation";
import TextToSpeech from "@/components/tools/text-to-speech/TextToSpeech";

export default function ToolEntry() {
  return <TextToSpeech education={<TTSEducation />} />;
}
