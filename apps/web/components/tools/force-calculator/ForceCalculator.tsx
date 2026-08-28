"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { ForceCalculator as ForceCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ForceInputPanel from "./ForceInputPanel";
import ForceResult from "./ForceResult";
import ForceQuickReference from "./ForceQuickReference";
import type { ForceMode, GravitationSolveFor, SecondLawSolveFor } from "./types";

const tool = new ForceCalculatorTool();

export default function ForceCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.force-calculator.nav");

  const [mode, setMode] = useState<ForceMode>("secondLaw");
  const [secondLawSolveFor, setSecondLawSolveFor] = useState<SecondLawSolveFor>("force");
  const [gravitationSolveFor, setGravitationSolveFor] = useState<GravitationSolveFor>("force");
  const [force, setForce] = useState("10");
  const [mass, setMass] = useState("2");
  const [acceleration, setAcceleration] = useState("5");
  const [mass1, setMass1] = useState("5.972e24");
  const [mass2, setMass2] = useState("1");
  const [distance, setDistance] = useState("6.371e6");

  const digitStyle: DigitStyle = resolveDigitStyle(force, mass, acceleration, mass1, mass2, distance);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        mode,
        secondLawSolveFor,
        gravitationSolveFor,
        force: parseLocalizedNumber(force) || 0,
        mass: parseLocalizedNumber(mass) || 0,
        acceleration: parseLocalizedNumber(acceleration) || 0,
        mass1: parseLocalizedNumber(mass1) || 0,
        mass2: parseLocalizedNumber(mass2) || 0,
        distance: parseLocalizedNumber(distance) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [mode, secondLawSolveFor, gravitationSolveFor, force, mass, acceleration, mass1, mass2, distance]);

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
            <ForceInputPanel
              mode={mode}
              onModeChange={setMode}
              secondLawSolveFor={secondLawSolveFor}
              onSecondLawSolveForChange={setSecondLawSolveFor}
              gravitationSolveFor={gravitationSolveFor}
              onGravitationSolveForChange={setGravitationSolveFor}
              force={force}
              onForceChange={setForce}
              mass={mass}
              onMassChange={setMass}
              acceleration={acceleration}
              onAccelerationChange={setAcceleration}
              mass1={mass1}
              onMass1Change={setMass1}
              mass2={mass2}
              onMass2Change={setMass2}
              distance={distance}
              onDistanceChange={setDistance}
            />
          }
          result={
            <ForceResult
              result={result}
              mode={mode}
              secondLawSolveFor={secondLawSolveFor}
              gravitationSolveFor={gravitationSolveFor}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="force-calculator" category="math-science" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ForceQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
