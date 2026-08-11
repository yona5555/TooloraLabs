"use client";

import { useEffect, useReducer, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import { calculatorReducer, initialState } from "./reducer";
import ScientificKeypad from "./ScientificKeypad";
import ScientificHistoryPanel from "./ScientificHistoryPanel";
import FunctionReferenceCard from "./FunctionReferenceCard";

const KEY_TO_DIGIT = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

export default function ScientificCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.scientific-calculator.nav");
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (KEY_TO_DIGIT.has(event.key)) {
        dispatch({ type: "digit", digit: event.key });
        return;
      }

      switch (event.key) {
        case ".":
          dispatch({ type: "decimal" });
          break;
        case "+":
          dispatch({ type: "operator", operator: "add", symbol: "+" });
          break;
        case "-":
          if (state.display.toLowerCase().endsWith("e")) {
            dispatch({ type: "expSign" });
          } else {
            dispatch({ type: "operator", operator: "subtract", symbol: "−" });
          }
          break;
        case "*":
        case "x":
        case "X":
          dispatch({ type: "operator", operator: "multiply", symbol: "×" });
          break;
        case "/":
          event.preventDefault();
          dispatch({ type: "operator", operator: "divide", symbol: "÷" });
          break;
        case "^":
          dispatch({ type: "operator", operator: "power", symbol: "^" });
          break;
        case "Enter":
        case "=":
          event.preventDefault();
          dispatch({ type: "equals" });
          break;
        case "Backspace":
          dispatch({ type: "backspace" });
          break;
        case "Escape":
          dispatch({ type: "clearAll" });
          break;
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [state.display]);

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
            <ScientificHistoryPanel
              history={state.history}
              onSelect={(value) => dispatch({ type: "loadHistory", value })}
            />
          }
          result={<ScientificKeypad state={state} dispatch={dispatch} />}
          sidebar={<RelatedToolsSidebar currentSlug="scientific-calculator" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <FunctionReferenceCard />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
