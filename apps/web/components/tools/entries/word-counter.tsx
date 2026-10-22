import WordCounterEducation from "@/components/tools/word-counter/WordCounterEducation";
import WordCounterTool from "@/components/tools/word-counter/WordCounterTool";

export default function ToolEntry() {
  return <WordCounterTool education={<WordCounterEducation />} />;
}
