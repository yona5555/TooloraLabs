import RomanEducation from "@/components/tools/roman-numeral-converter/RomanEducation";
import RomanNumeralConverter from "@/components/tools/roman-numeral-converter/RomanNumeralConverter";

export default function ToolEntry() {
  return <RomanNumeralConverter education={<RomanEducation />} />;
}
