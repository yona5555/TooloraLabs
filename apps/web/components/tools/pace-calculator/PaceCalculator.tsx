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
  partsFromSeconds,
  convertDistanceValue,
  convertPaceSeconds,
  RACE_PRESET_DISTANCE_KM,
  type DistanceUnit,
  type RacePreset,
} from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import PaceModeTabs from "./PaceModeTabs";
import PaceCalcInputPanel from "./PaceCalcInputPanel";
import MultipointInputPanel from "./MultipointInputPanel";
import ConverterInputPanel from "./ConverterInputPanel";
import FinishTimeInputPanel from "./FinishTimeInputPanel";
import PaceResult from "./PaceResult";
import PaceRaceLadder from "./PaceRaceLadder";
import { PaceLiveContext, type PaceSnapshot } from "./PaceLiveContext";
import { REF_KM } from "./pace";
import type { MultipointRowDraft, PaceScenario, SolveField, TopMode } from "./types";

function toNum(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? 0 : n;
}

function round4(value: number): string {
  return String(Number(value.toFixed(4)));
}

export default function PaceCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.pace-calculator.nav");
  const tv = useTranslations("tools.pace-calculator.visuals");
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

  function handleScenarioPreset(scenario: PaceScenario) {
    setSolveFor("pace");
    setDistanceUnit("km");
    setRacePreset(scenario.racePreset);
    setDistance(round4(scenario.distanceKm));
    const parts = partsFromSeconds(scenario.timeSeconds);
    setHours(String(parts.hours));
    setMinutes(String(parts.minutes));
    setSeconds(String(parts.seconds));
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

  // Live: every valid edit updates the Result, the 3D track and the cards at once; an invalid or
  // half-typed input keeps that mode's last good result on screen (with the calculator's note).
  const liveSnap = useMemo<PaceSnapshot | null>(() => {
    if (topMode === "calculator") {
      if (!calcResult.valid) return null;
      return { mode: topMode, unit: calcResult.distanceUnit, km: convertDistanceValue(calcResult.distance, calcResult.distanceUnit, "km"), sec: calcResult.timeSeconds, solveFor };
    }
    if (topMode === "finish-time") {
      const knownDistance = toNum(finishKnownDistance);
      const knownTimeSeconds = secondsFromParts(toNum(finishHours), toNum(finishMinutes), toNum(finishSeconds));
      const { predictedSeconds, targetDistance } = finishComputation;
      if (!(predictedSeconds > 0 && targetDistance > 0)) return null;
      return {
        mode: topMode,
        unit: finishUnit,
        km: convertDistanceValue(knownDistance, finishUnit, "km"),
        sec: knownTimeSeconds,
        targetKm: convertDistanceValue(targetDistance, finishUnit, "km"),
        predictedSec: predictedSeconds,
      };
    }
    if (topMode === "converter") {
      if (!(Number.isFinite(converterPaceSeconds) && converterPaceSeconds > 0)) return null;
      const perKm = convertPaceSeconds(converterPaceSeconds, converterUnit, "km");
      return { mode: topMode, unit: converterUnit, km: REF_KM, sec: REF_KM * perKm, assumedDistance: true };
    }
    if (multipointSegments.length === 0) return null;
    // The package returns segment distances in km (its pace is per km), whatever the unit chosen.
    const segments = multipointSegments.map((seg) => ({ from: seg.fromIndex, to: seg.toIndex, km: seg.segmentDistance, sec: seg.segmentTimeSeconds }));
    return {
      mode: topMode,
      unit: multipointUnit,
      km: segments.reduce((sum, seg) => sum + seg.km, 0),
      sec: segments.reduce((sum, seg) => sum + seg.sec, 0),
      segments,
    };
  }, [topMode, calcResult, solveFor, finishKnownDistance, finishHours, finishMinutes, finishSeconds, finishComputation, finishUnit, converterPaceSeconds, converterUnit, multipointSegments, multipointUnit]);
  const [good, setGood] = useState<Partial<Record<TopMode, PaceSnapshot>>>({});
  if (liveSnap && good[topMode] !== liveSnap) setGood({ ...good, [topMode]: liveSnap });
  const shown: PaceSnapshot = liveSnap ?? good[topMode] ?? { mode: topMode, unit: "km", km: 5, sec: 1500 };

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
    { id: "notices", label: tv("notices.title") },
  ];

  let input: ReactNode;

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
        onScenarioPreset={handleScenarioPreset}
      />
    );
  } else if (topMode === "multipoint") {
    input = <MultipointInputPanel unit={multipointUnit} onUnitChange={setMultipointUnit} rows={multipointRows} onChange={setMultipointRows} />;
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
  }

  return (
    <PaceLiveContext.Provider value={shown}>
      <div id="tool" className="scroll-mt-32">
        <div className="mb-4">
          <PaceModeTabs mode={topMode} onModeChange={setTopMode} />
        </div>
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
              {input}
              {/* Multipoint's checkpoint list is already taller than the Result: no filler there. */}
              {topMode !== "multipoint" && <PaceRaceLadder />}
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <PaceResult fill snap={shown} invalid={!liveSnap} digitStyle={digitStyle} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="pace-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="pace-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </PaceLiveContext.Provider>
  );
}
