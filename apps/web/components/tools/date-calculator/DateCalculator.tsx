"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { DateCalculator as DateTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import DateInputPanel from "./DateInputPanel";
import DateResult from "./DateResult";
import DateQuickReference from "./DateQuickReference";
import type { DateCalculatorMode, DateOperation, DateUnit } from "./types";

const tool = new DateTool();

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function DateCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.date-calculator.nav");
  const [mode, setMode] = useState<DateCalculatorMode>("difference");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [amount, setAmount] = useState("30");
  const [unit, setUnit] = useState<DateUnit>("days");
  const [operation, setOperation] = useState<DateOperation>("add");

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
            />
          }
          result={<DateResult mode={mode} result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="date-calculator" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
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
