"use client";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { resolveDigitStyle } from "@/lib/digit-style";
import { CountdownCalculator as CountdownTool, type CountdownOutput } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import CountdownInputPanel from "./CountdownInputPanel";
import CountdownResult from "./CountdownResult";
import CountdownQuickReference from "./CountdownQuickReference";
import { subscribeToClock, getNowSnapshot, getServerNowSnapshot } from "./clock";
import type { CountdownScenario } from "./types";

const tool = new CountdownTool();

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function dateInDays(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

export default function CountdownToEventCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.countdown-to-event-calculator.nav");
  const tScenarios = useTranslations("tools.countdown-to-event-calculator.scenarios");
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("00:00");

  function handleScenarioPreset(scenario: CountdownScenario) {
    setEventName(tScenarios(scenario.eventNameKey));
    setDate(dateInDays(scenario.daysFromNow));
    setTime(scenario.time);
  }

  function handleClear() {
    setEventName("");
    setDate(defaultDate());
    setTime("00:00");
  }

  const now = useSyncExternalStore(subscribeToClock, getNowSnapshot, getServerNowSnapshot);
  const digitStyle = resolveDigitStyle(date, time);

  const hasTarget = Boolean(date);

  const result = useMemo<CountdownOutput>(() => {
    if (!hasTarget || !now) {
      return { error: null, isPast: false, totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const targetDateTimeISO = `${date}T${time || "00:00"}:00`;
    const output = tool.execute({ targetDateTimeISO, nowMs: now }, { locale: "en-US" });
    return output.data;
  }, [date, time, now, hasTarget]);

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
            <CountdownInputPanel
              eventName={eventName}
              onEventNameChange={setEventName}
              date={date}
              onDateChange={setDate}
              time={time}
              onTimeChange={setTime}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={
            <CountdownResult result={result} eventName={eventName} hasTarget={hasTarget} digitStyle={digitStyle} />
          }
          sidebar={<RelatedToolsSidebar currentSlug="countdown-to-event-calculator" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="countdown-to-event-calculator" />
              <SectionNav items={navItems} />
              <CountdownQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
