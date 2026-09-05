"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { solveSSS, solveSAS, solveASA, solveAAS } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import TriangleInputPanel from "./TriangleInputPanel";
import TriangleResult from "./TriangleResult";
import TriangleQuickReference from "./TriangleQuickReference";
import { EMPTY_TRIANGLE_RESULT, type TriangleMode } from "./types";

function toNum(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? -1 : n;
}

const DEFAULTS: Record<TriangleMode, [string, string, string]> = {
  sss: ["3", "4", "5"],
  sas: ["3", "90", "4"],
  asa: ["36.87", "5", "53.13"],
  aas: ["36.87", "53.13", "3"],
};

export default function TriangleCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.triangle-calculator.nav");
  const [mode, setMode] = useState<TriangleMode>("sss");
  const [fields, setFields] = useState<Record<TriangleMode, [string, string, string]>>(DEFAULTS);

  const digitStyle = resolveDigitStyle(...fields[mode]);

  const result = useMemo(() => {
    const [f1, f2, f3] = fields[mode].map(toNum);
    if (mode === "sss") return solveSSS(f1, f2, f3);
    if (mode === "sas") return solveSAS(f1, f2, f3);
    if (mode === "asa") return solveASA(f1, f2, f3);
    return solveAAS(f1, f2, f3);
  }, [mode, fields]);

  function updateField(index: 0 | 1 | 2, value: string) {
    setFields((prev) => {
      const next = [...prev[mode]] as [string, string, string];
      next[index] = value;
      return { ...prev, [mode]: next };
    });
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const [field1, field2, field3] = fields[mode];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <TriangleInputPanel
              mode={mode}
              onModeChange={setMode}
              field1={field1}
              field2={field2}
              field3={field3}
              onField1Change={(v) => updateField(0, v)}
              onField2Change={(v) => updateField(1, v)}
              onField3Change={(v) => updateField(2, v)}
            />
          }
          result={<TriangleResult result={result ?? EMPTY_TRIANGLE_RESULT} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="triangle-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <TriangleQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
