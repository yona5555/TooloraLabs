"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { DensityCalculator as DensityCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import DensityInputPanel from "./DensityInputPanel";
import DensityResult from "./DensityResult";
import DensityQuickReference from "./DensityQuickReference";
import type { DensityOperation } from "./types";

const tool = new DensityCalculatorTool();

export default function DensityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.density-calculator.nav");

  const [operation, setOperation] = useState<DensityOperation>("solveDensity");
  const [mass, setMass] = useState("100");
  const [volume, setVolume] = useState("50");
  const [density, setDensity] = useState("2.7");

  const digitStyle: DigitStyle = resolveDigitStyle(mass, volume, density);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        operation,
        mass: parseLocalizedNumber(mass) || 0,
        volume: parseLocalizedNumber(volume) || 0,
        density: parseLocalizedNumber(density) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [operation, mass, volume, density]);

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
            <DensityInputPanel
              operation={operation}
              onOperationChange={setOperation}
              mass={mass}
              onMassChange={setMass}
              volume={volume}
              onVolumeChange={setVolume}
              density={density}
              onDensityChange={setDensity}
            />
          }
          result={<DensityResult result={result} operation={operation} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="density-calculator" category="physics" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <DensityQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
