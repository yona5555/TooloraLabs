"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { MatrixCalculator as MatrixCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import MatrixInputPanel from "./MatrixInputPanel";
import MatrixResult from "./MatrixResult";
import MatrixQuickReference from "./MatrixQuickReference";

const tool = new MatrixCalculatorTool();

export default function MatrixCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.matrix-calculator.nav");

  const [a11, setA11] = useState("4");
  const [a12, setA12] = useState("7");
  const [a21, setA21] = useState("2");
  const [a22, setA22] = useState("6");
  const [b11, setB11] = useState("1");
  const [b12, setB12] = useState("0");
  const [b21, setB21] = useState("0");
  const [b22, setB22] = useState("1");

  const digitStyle: DigitStyle = resolveDigitStyle(a11, a12, a21, a22, b11, b12, b21, b22);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        a11: parseLocalizedNumber(a11) || 0,
        a12: parseLocalizedNumber(a12) || 0,
        a21: parseLocalizedNumber(a21) || 0,
        a22: parseLocalizedNumber(a22) || 0,
        b11: parseLocalizedNumber(b11) || 0,
        b12: parseLocalizedNumber(b12) || 0,
        b21: parseLocalizedNumber(b21) || 0,
        b22: parseLocalizedNumber(b22) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [a11, a12, a21, a22, b11, b12, b21, b22]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <MatrixInputPanel
              a11={a11}
              onA11Change={setA11}
              a12={a12}
              onA12Change={setA12}
              a21={a21}
              onA21Change={setA21}
              a22={a22}
              onA22Change={setA22}
              b11={b11}
              onB11Change={setB11}
              b12={b12}
              onB12Change={setB12}
              b21={b21}
              onB21Change={setB21}
              b22={b22}
              onB22Change={setB22}
            />
          }
          result={<MatrixResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="matrix-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <MatrixQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
