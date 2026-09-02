"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChemicalEquationBalancer as ChemicalEquationBalancerTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import BalancerInputPanel from "./BalancerInputPanel";
import BalancerResult from "./BalancerResult";
import BalancerQuickReference from "./BalancerQuickReference";

const tool = new ChemicalEquationBalancerTool();

export default function ChemicalEquationBalancer({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.chemical-equation-balancer.nav");

  const [equation, setEquation] = useState("Fe + O2 -> Fe2O3");

  const digitStyle = resolveDigitStyle(equation);

  const result = useMemo(() => tool.execute({ equation }, { locale: "en-US" }).data, [equation]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<BalancerInputPanel equation={equation} onEquationChange={setEquation} />}
          result={<BalancerResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="chemical-equation-balancer" category="chemistry" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <BalancerQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
