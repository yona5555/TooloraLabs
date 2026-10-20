import MathSolver from "@/components/tools/step-by-step-math-solver/MathSolver";
import MathSolverEducation from "@/components/tools/step-by-step-math-solver/MathSolverEducation";

export default function ToolEntry() {
  return <MathSolver education={<MathSolverEducation />} />;
}
