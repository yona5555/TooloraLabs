"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { ProjectileMotionCalculator as ProjectileMotionCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ProjectileMotionInputPanel from "./ProjectileMotionInputPanel";
import ProjectileMotionResult from "./ProjectileMotionResult";
import ProjectileMotionQuickReference from "./ProjectileMotionQuickReference";

const tool = new ProjectileMotionCalculatorTool();

export default function ProjectileMotionCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.projectile-motion-calculator.nav");

  const [speed, setSpeed] = useState("20");
  const [angle, setAngle] = useState("45");
  const [height, setHeight] = useState("0");
  const [gravity, setGravity] = useState("9.81");

  const digitStyle: DigitStyle = resolveDigitStyle(speed, angle, height, gravity);

  const speedValue = parseLocalizedNumber(speed) || 0;
  const angleValue = parseLocalizedNumber(angle) || 0;
  const heightValue = parseLocalizedNumber(height) || 0;
  const gravityValue = parseLocalizedNumber(gravity) || 0;

  const result = useMemo(() => {
    const output = tool.execute(
      {
        speed: speedValue,
        angle: angleValue,
        height: heightValue,
        gravity: gravityValue,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [speedValue, angleValue, heightValue, gravityValue]);

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
            <ProjectileMotionInputPanel
              speed={speed}
              onSpeedChange={setSpeed}
              angle={angle}
              onAngleChange={setAngle}
              height={height}
              onHeightChange={setHeight}
              gravity={gravity}
              onGravityChange={setGravity}
            />
          }
          result={
            <ProjectileMotionResult
              result={result}
              speed={speedValue}
              angle={angleValue}
              height={heightValue}
              gravity={gravityValue}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="projectile-motion-calculator" category="physics" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ProjectileMotionQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
