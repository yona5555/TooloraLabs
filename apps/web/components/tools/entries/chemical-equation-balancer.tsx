import BalancerEducation from "@/components/tools/chemical-equation-balancer/BalancerEducation";
import ChemicalEquationBalancer from "@/components/tools/chemical-equation-balancer/ChemicalEquationBalancer";

export default function ToolEntry() {
  return <ChemicalEquationBalancer education={<BalancerEducation />} />;
}
