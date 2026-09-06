"use client";
import { useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { DiceRollerCalculator, type DiceRollerOutput } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import DiceInputPanel from "./DiceInputPanel";
import DiceResult from "./DiceResult";
import DiceQuickReference from "./DiceQuickReference";
import type { DiceFaces, RollHistoryEntry } from "./types";

const tool = new DiceRollerCalculator();
const ROLL_ANIMATION_MS = 500;
const MAX_HISTORY = 20;

const INITIAL_RESULT: DiceRollerOutput = {
  error: null,
  rolls: [1],
  total: 1,
  diceCount: 1,
  faces: 6,
};

export default function DiceRoller({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.dice-roller.nav");
  const [diceCount, setDiceCount] = useState("2");
  const [faces, setFaces] = useState<DiceFaces>(6);
  const [result, setResult] = useState<DiceRollerOutput>(INITIAL_RESULT);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<RollHistoryEntry[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleRoll() {
    const count = diceCount.trim() === "" ? NaN : parseInt(diceCount, 10);
    setIsRolling(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const output = tool.execute({ diceCount: count, faces }, { locale: "en-US" });
      setResult(output.data);
      setIsRolling(false);
      if (!output.data.error) {
        setHistory((prev) =>
          [
            {
              id: `${Date.now()}-${Math.random()}`,
              faces: output.data.faces,
              rolls: output.data.rolls,
              total: output.data.total,
            },
            ...prev,
          ].slice(0, MAX_HISTORY),
        );
      }
    }, ROLL_ANIMATION_MS);
  }

  function handleClearHistory() {
    setHistory([]);
  }

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
            <DiceInputPanel
              diceCount={diceCount}
              onDiceCountChange={setDiceCount}
              faces={faces}
              onFacesChange={setFaces}
              onRoll={handleRoll}
              isRolling={isRolling}
            />
          }
          result={
            <DiceResult
              result={result}
              isRolling={isRolling}
              history={history}
              onClearHistory={handleClearHistory}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="dice-roller" category="fun-entertainment" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <DiceQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
