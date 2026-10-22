import RandomNumberEducation from "@/components/tools/random-number-generator/RandomNumberEducation";
import RandomNumberGenerator from "@/components/tools/random-number-generator/RandomNumberGenerator";

export default function ToolEntry() {
  return <RandomNumberGenerator education={<RandomNumberEducation />} />;
}
