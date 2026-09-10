"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { DateCalculator as DateTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import DateInputPanel from "./DateInputPanel";
import DateResult from "./DateResult";
import DateQuickReference from "./DateQuickReference";
import type { DateCalculatorMode, DateOperation, DateScenario, DateUnit } from "./types";

const tool = new DateTool();

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DEFAULTS = { mode: "difference" as DateCalculatorMode, amount: "30", unit: "days" as DateUnit, operation: "add" as DateOperation };

export default function DateCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.date-calculator.nav");
  const [mode, setMode] = useState<DateCalculatorMode>(DEFAULTS.mode);
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [unit, setUnit] = useState<DateUnit>(DEFAULTS.unit);
  const [operation, setOperation] = useState<DateOperation>(DEFAULTS.operation);

  function handleScenarioPreset(scenario: DateScenario) {
    setMode(scenario.mode);
    setStartDate(isoDaysAgo(scenario.startDaysAgo));
    setEndDate(isoDaysAgo(scenario.endDaysAgo));
    setAmount(scenario.amount);
    setUnit(scenario.unit);
    setOperation(scenario.operation);
  }

  function handleClear() {
    setMode(DEFAULTS.mode);
    setStartDate(todayISO());
    setEndDate(todayISO());
    setAmount(DEFAULTS.amount);
    setUnit(DEFAULTS.unit);
    setOperation(DEFAULTS.operation);
  }

  const digitStyle = resolveDigitStyle(amount);

  const result = useMemo(() => {
    const amountNum = parseInt(amount, 10);
    const output = tool.execute(
      {
        mode,
        startDate,
        endDate,
        amount: Number.isFinite(amountNum) ? amountNum : -1,
        unit,
        operation,
      },
      { locale: "en-US" },
    );
    return output.data;
  }, [mode, startDate, endDate, amount, unit, operation]);

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
            <DateInputPanel
              mode={mode}
              onModeChange={setMode}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              amount={amount}
              onAmountChange={setAmount}
              unit={unit}
              onUnitChange={setUnit}
              operation={operation}
              onOperationChange={setOperation}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={<DateResult mode={mode} result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="date-calculator" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="date-calculator" />
              <SectionNav items={navItems} />
              <DateQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
