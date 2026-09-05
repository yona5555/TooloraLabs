"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  solvePaceFromDistanceAndTime,
  solveTimeFromDistanceAndPace,
  solveDistanceFromTimeAndPace,
  calculateMultipointSegments,
  predictFinishTimeSeconds,
  secondsFromParts,
  convertDistanceValue,
  RACE_PRESET_DISTANCE_KM,
  type DistanceUnit,
  type RacePreset,
} from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import PaceModeTabs from "./PaceModeTabs";
import PaceCalcInputPanel from "./PaceCalcInputPanel";
import PaceCalcResult from "./PaceCalcResult";
import PaceQuickReference from "./PaceQuickReference";
import MultipointInputPanel from "./MultipointInputPanel";
import MultipointResult from "./MultipointResult";
import ConverterInputPanel from "./ConverterInputPanel";
import ConverterResult from "./ConverterResult";
import FinishTimeInputPanel from "./FinishTimeInputPanel";
import FinishTimeResult from "./FinishTimeResult";
import type { MultipointRowDraft, SolveField, TopMode } from "./types";

function toNum(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? 0 : n;
}

function round4(value: number): string {
  return String(Number(value.toFixed(4)));
}

export default function PaceCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.pace-calculator.nav");
  const [topMode, setTopMode] = useState<TopMode>("calculator");

  // --- Pace Calculator mode (Pace / Time / Distance solve tabs) ---
  const [solveFor, setSolveFor] = useState<SolveField>("time");
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("km");
  const [distance, setDistance] = useState("5");
  const [racePreset, setRacePreset] = useState("5k");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");
  const [paceMinutes, setPaceMinutes] = useState("5");
  const [paceSeconds, setPaceSeconds] = useState("0");

  const calcResult = useMemo(() => {
    const timeSeconds = secondsFromParts(toNum(hours), toNum(minutes), toNum(seconds));
    const paceSecondsPerUnit = toNum(paceMinutes) * 60 + toNum(paceSeconds);
    const distanceValue = toNum(distance);
    if (solveFor === "pace") return solvePaceFromDistanceAndTime(distanceValue, distanceUnit, timeSeconds);
    if (solveFor === "time") return solveTimeFromDistanceAndPace(distanceValue, distanceUnit, paceSecondsPerUnit);
    return solveDistanceFromTimeAndPace(timeSeconds, distanceUnit, paceSecondsPerUnit);
  }, [solveFor, distance, distanceUnit, hours, minutes, seconds, paceMinutes, paceSeconds]);

  function handleDistanceChange(value: string) {
    setDistance(value);
    setRacePreset("");
  }

  function handleRacePresetChange(preset: string) {
    setRacePreset(preset);
    if (preset) setDistance(round4(convertDistanceValue(RACE_PRESET_DISTANCE_KM[preset as RacePreset], "km", distanceUnit)));
  }

  function handleDistanceUnitChange(nextUnit: DistanceUnit) {
    if (racePreset) {
      setDistance(round4(convertDistanceValue(RACE_PRESET_DISTANCE_KM[racePreset as RacePreset], "km", nextUnit)));
    } else {
      const currentValue = toNum(distance);
      if (currentValue > 0) setDistance(round4(convertDistanceValue(currentValue, distanceUnit, nextUnit)));
    }
    setDistanceUnit(nextUnit);
  }

  // --- Multipoint mode ---
  const [multipointUnit, setMultipointUnit] = useState<DistanceUnit>("km");
  const [multipointRows, setMultipointRows] = useState<MultipointRowDraft[]>([
    { distance: "0", hours: "0", minutes: "0", seconds: "0" },
    { distance: "5", hours: "0", minutes: "25", seconds: "0" },
    { distance: "10", hours: "0", minutes: "51", seconds: "30" },
  ]);

  const multipointSegments = useMemo(() => {
    const points = multipointRows.map((row) => ({
      distance: toNum(row.distance),
      distanceUnit: multipointUnit,
      timeSeconds: secondsFromParts(toNum(row.hours), toNum(row.minutes), toNum(row.seconds)),
    }));
    return calculateMultipointSegments(points);
  }, [multipointRows, multipointUnit]);

  // --- Pace Converter mode ---
  const [converterUnit, setConverterUnit] = useState<DistanceUnit>("km");
  const [converterMinutes, setConverterMinutes] = useState("5");
  const [converterSeconds, setConverterSeconds] = useState("0");
  const converterPaceSeconds = toNum(converterMinutes) * 60 + toNum(converterSeconds);

  // --- Finish Time mode ---
  const [finishUnit, setFinishUnit] = useState<DistanceUnit>("km");
  const [finishKnownDistance, setFinishKnownDistance] = useState("10");
  const [finishHours, setFinishHours] = useState("0");
  const [finishMinutes, setFinishMinutes] = useState("50");
  const [finishSeconds, setFinishSeconds] = useState("0");
  const [finishTargetPreset, setFinishTargetPreset] = useState("marathon");
  const [finishTargetDistance, setFinishTargetDistance] = useState("42.195");

  const finishComputation = useMemo(() => {
    const knownDistance = toNum(finishKnownDistance);
    const knownTimeSeconds = secondsFromParts(toNum(finishHours), toNum(finishMinutes), toNum(finishSeconds));
    const targetDistance = finishTargetPreset
      ? convertDistanceValue(RACE_PRESET_DISTANCE_KM[finishTargetPreset as RacePreset], "km", finishUnit)
      : toNum(finishTargetDistance);
    return { predictedSeconds: predictFinishTimeSeconds(knownDistance, knownTimeSeconds, targetDistance), targetDistance };
  }, [finishKnownDistance, finishHours, finishMinutes, finishSeconds, finishTargetPreset, finishTargetDistance, finishUnit]);

  function handleFinishUnitChange(nextUnit: DistanceUnit) {
    const currentKnown = toNum(finishKnownDistance);
    if (currentKnown > 0) setFinishKnownDistance(round4(convertDistanceValue(currentKnown, finishUnit, nextUnit)));
    if (!finishTargetPreset) {
      const currentTarget = toNum(finishTargetDistance);
      if (currentTarget > 0) setFinishTargetDistance(round4(convertDistanceValue(currentTarget, finishUnit, nextUnit)));
    }
    setFinishUnit(nextUnit);
  }

  const digitStyle = resolveDigitStyle(
    distance,
    hours,
    minutes,
    seconds,
    paceMinutes,
    paceSeconds,
    converterMinutes,
    converterSeconds,
    finishKnownDistance,
    finishHours,
    finishMinutes,
    finishSeconds,
    finishTargetDistance,
    ...multipointRows.flatMap((row) => [row.distance, row.hours, row.minutes, row.seconds])
  );

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  let input: ReactNode;
  let result: ReactNode;

  if (topMode === "calculator") {
    input = (
      <PaceCalcInputPanel
        solveFor={solveFor}
        onSolveForChange={setSolveFor}
        distanceUnit={distanceUnit}
        onDistanceUnitChange={handleDistanceUnitChange}
        distance={distance}
        onDistanceChange={handleDistanceChange}
        racePreset={racePreset}
        onRacePresetChange={handleRacePresetChange}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
        onHoursChange={setHours}
        onMinutesChange={setMinutes}
        onSecondsChange={setSeconds}
        paceMinutes={paceMinutes}
        paceSeconds={paceSeconds}
        onPaceMinutesChange={setPaceMinutes}
        onPaceSecondsChange={setPaceSeconds}
      />
    );
    result = <PaceCalcResult result={calcResult} solveFor={solveFor} digitStyle={digitStyle} />;
  } else if (topMode === "multipoint") {
    input = <MultipointInputPanel unit={multipointUnit} onUnitChange={setMultipointUnit} rows={multipointRows} onChange={setMultipointRows} />;
    result = <MultipointResult segments={multipointSegments} unit={multipointUnit} digitStyle={digitStyle} />;
  } else if (topMode === "converter") {
    input = (
      <ConverterInputPanel
        fromUnit={converterUnit}
        onFromUnitChange={setConverterUnit}
        minutes={converterMinutes}
        seconds={converterSeconds}
        onMinutesChange={setConverterMinutes}
        onSecondsChange={setConverterSeconds}
      />
    );
    result = <ConverterResult fromUnit={converterUnit} paceSecondsPerUnit={converterPaceSeconds} digitStyle={digitStyle} />;
  } else {
    input = (
      <FinishTimeInputPanel
        distanceUnit={finishUnit}
        onDistanceUnitChange={handleFinishUnitChange}
        knownDistance={finishKnownDistance}
        onKnownDistanceChange={setFinishKnownDistance}
        hours={finishHours}
        minutes={finishMinutes}
        seconds={finishSeconds}
        onHoursChange={setFinishHours}
        onMinutesChange={setFinishMinutes}
        onSecondsChange={setFinishSeconds}
        targetPreset={finishTargetPreset}
        onTargetPresetChange={setFinishTargetPreset}
        targetDistance={finishTargetDistance}
        onTargetDistanceChange={setFinishTargetDistance}
      />
    );
    result = (
      <FinishTimeResult predictedSeconds={finishComputation.predictedSeconds} targetDistance={finishComputation.targetDistance} distanceUnit={finishUnit} digitStyle={digitStyle} />
    );
  }

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <div className="mb-4">
          <PaceModeTabs mode={topMode} onModeChange={setTopMode} />
        </div>
        <ToolAboveFold
          input={input}
          result={result}
          sidebar={<RelatedToolsSidebar currentSlug="pace-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              {topMode === "calculator" && <PaceQuickReference />}
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
