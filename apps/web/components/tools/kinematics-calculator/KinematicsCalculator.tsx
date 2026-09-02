"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { KinematicsCalculator as KinematicsCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import KinematicsInputPanel from "./KinematicsInputPanel";
import KinematicsResult from "./KinematicsResult";
import KinematicsQuickReference from "./KinematicsQuickReference";
import type { KinematicsMode, KinematicsSolveForDistance, KinematicsSolveForTime } from "./types";

const tool = new KinematicsCalculatorTool();

export default function KinematicsCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.kinematics-calculator.nav");

  const [mode, setMode] = useState<KinematicsMode>("timeBased");
  const [solveForTime, setSolveForTime] = useState<KinematicsSolveForTime>("v");
  const [solveForDistance, setSolveForDistance] = useState<KinematicsSolveForDistance>("v");
  const [v0, setV0] = useState("0");
  const [v, setV] = useState("10");
  const [a, setA] = useState("2");
  const [t, setT] = useState("5");
  const [dx, setDx] = useState("25");

  const digitStyle: DigitStyle = resolveDigitStyle(v0, v, a, t, dx);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        mode,
        solveForTime,
        solveForDistance,
        v0: parseLocalizedNumber(v0) || 0,
        v: parseLocalizedNumber(v) || 0,
        a: parseLocalizedNumber(a) || 0,
        t: parseLocalizedNumber(t) || 0,
        dx: parseLocalizedNumber(dx) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [mode, solveForTime, solveForDistance, v0, v, a, t, dx]);

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
            <KinematicsInputPanel
              mode={mode}
              onModeChange={setMode}
              solveForTime={solveForTime}
              onSolveForTimeChange={setSolveForTime}
              solveForDistance={solveForDistance}
              onSolveForDistanceChange={setSolveForDistance}
              v0={v0}
              onV0Change={setV0}
              v={v}
              onVChange={setV}
              a={a}
              onAChange={setA}
              t={t}
              onTChange={setT}
              dx={dx}
              onDxChange={setDx}
            />
          }
          result={<KinematicsResult result={result} mode={mode} solveForTime={solveForTime} solveForDistance={solveForDistance} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="kinematics-calculator" category="physics" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <KinematicsQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
