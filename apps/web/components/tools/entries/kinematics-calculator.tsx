import KinematicsCalculator from "@/components/tools/kinematics-calculator/KinematicsCalculator";
import KinematicsEducation from "@/components/tools/kinematics-calculator/KinematicsEducation";

export default function ToolEntry() {
  return <KinematicsCalculator education={<KinematicsEducation />} />;
}
