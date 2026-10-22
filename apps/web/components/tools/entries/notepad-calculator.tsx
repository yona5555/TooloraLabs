import NotepadCalculator from "@/components/tools/notepad-calculator/NotepadCalculator";
import NotepadEducation from "@/components/tools/notepad-calculator/NotepadEducation";

export default function ToolEntry() {
  return <NotepadCalculator education={<NotepadEducation />} />;
}
