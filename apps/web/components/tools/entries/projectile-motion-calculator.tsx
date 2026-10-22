import ProjectileMotionCalculator from "@/components/tools/projectile-motion-calculator/ProjectileMotionCalculator";
import ProjectileMotionEducation from "@/components/tools/projectile-motion-calculator/ProjectileMotionEducation";

export default function ToolEntry() {
  return <ProjectileMotionCalculator education={<ProjectileMotionEducation />} />;
}
