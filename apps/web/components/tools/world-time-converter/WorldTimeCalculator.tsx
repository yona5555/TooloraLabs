"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import { convertBetweenZones, compareZonesAtInstant } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import WorldTimeInputPanel from "./WorldTimeInputPanel";
import WorldTimeResult from "./WorldTimeResult";
import WorldTimeDisclaimer from "./WorldTimeDisclaimer";
import WorldClockList from "./WorldClockList";
import MeetingPlanner from "./MeetingPlanner";
import { findCityById } from "@/lib/worldtime/cities";

const digitStyle: DigitStyle = "western";

/** The wall-clock reading in `ianaZone` at `instant`, as a `datetime-local`-compatible string. */
function zonedWallTimeAsInputValue(instant: Date, ianaZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(instant)) {
    parts[part.type] = part.value;
  }
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export default function WorldTimeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.world-time-converter.nav");

  const [fromCityId, setFromCityId] = useState("America/New_York");
  const [toCityId, setToCityId] = useState("Europe/London");
  const [useNow, setUseNow] = useState(true);
  const [nowSnapshot, setNowSnapshot] = useState(() => new Date());
  const [customDateTime, setCustomDateTime] = useState(() => zonedWallTimeAsInputValue(nowSnapshot, "America/New_York"));

  const fromCity = findCityById(fromCityId) ?? findCityById("America/New_York")!;
  const toCity = findCityById(toCityId) ?? findCityById("Europe/London")!;

  function handleSwap() {
    setFromCityId(toCityId);
    setToCityId(fromCityId);
  }

  function handleUseNowChange(value: boolean) {
    setUseNow(value);
    if (value) {
      setNowSnapshot(new Date());
    } else {
      setCustomDateTime(zonedWallTimeAsInputValue(new Date(), fromCity.ianaZone));
    }
  }

  const result = useMemo(() => {
    if (useNow) {
      // `nowSnapshot` is already a known absolute instant — comparing zones directly
      // at that instant, rather than treating its local getters as a "From city" wall
      // clock reading, is what keeps this correct regardless of the visitor's own
      // system time zone (which has no relationship to either city being compared).
      return compareZonesAtInstant(nowSnapshot, fromCity.ianaZone, toCity.ianaZone);
    }

    const [datePart, timePart] = customDateTime.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = (timePart ?? "00:00").split(":").map(Number);
    return convertBetweenZones(year, month, day, hour, minute, fromCity.ianaZone, toCity.ianaZone);
  }, [useNow, nowSnapshot, customDateTime, fromCity, toCity]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "world-clock", label: tNav("worldClock") },
    { id: "meeting-planner", label: tNav("meetingPlanner") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <WorldTimeInputPanel
              fromCityId={fromCityId}
              onFromCityChange={setFromCityId}
              toCityId={toCityId}
              onToCityChange={setToCityId}
              onSwap={handleSwap}
              useNow={useNow}
              onUseNowChange={handleUseNowChange}
              customDateTime={customDateTime}
              onCustomDateTimeChange={setCustomDateTime}
            />
          }
          result={<WorldTimeResult fromCity={fromCity} toCity={toCity} result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="world-time-converter" category="calculators" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <WorldTimeDisclaimer />
              <WorldClockList digitStyle={digitStyle} />
              <MeetingPlanner fromCity={fromCity} toCity={toCity} referenceDate={nowSnapshot} digitStyle={digitStyle} />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
