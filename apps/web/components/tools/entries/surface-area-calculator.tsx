import SurfaceAreaCalculator from "@/components/tools/surface-area-calculator/SurfaceAreaCalculator";
import SurfaceAreaEducation from "@/components/tools/surface-area-calculator/SurfaceAreaEducation";

export default function ToolEntry() {
  return <SurfaceAreaCalculator education={<SurfaceAreaEducation />} />;
}
