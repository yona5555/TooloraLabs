"use client";
import { useRef } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { KM_PER_MILE } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup, type LiveTableRow } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import PaceShareExportModal from "./PaceShareExportModal";
import { paceOf, type PaceSnapshot } from "./PaceLiveContext";
import { MAIN_RACES, REF_KM, RIEGEL, clock, pacePer, riegel, toUnit } from "./pace";
import { useSnapTableRows } from "../ideal-weight-calculator/useSnapTableRows";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const PaceTrackScene3D = dynamic(() => import("./PaceTrackScene3D"), { ssr: false });

type Props = {
  /** The active mode's last valid effort. */
  snap: PaceSnapshot;
  /** The current inputs are invalid: the last good result stays, with the calculator's note. */
  invalid: boolean;
  digitStyle: DigitStyle;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

/** One Result card for all four modes: deep live table on the left, the 3D track on the right. */
export default function PaceResult({ snap, invalid, digitStyle, fill = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useSnapTableRows(wrapRef);
  const t = useTranslations("tools.pace-calculator.result");
  const tForm = useTranslations("tools.pace-calculator.form");
  const tFinish = useTranslations("tools.pace-calculator.finishTime");
  const tConv = useTranslations("tools.pace-calculator.converter");
  const tMulti = useTranslations("tools.pace-calculator.multipoint");
  const tRace = useTranslations("tools.pace-calculator.visuals.common.races");
  const tv = useTranslations("tools.pace-calculator.visuals.result");
  const n2 = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 2 });
  const n3 = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 3 });

  const { unit, km, sec, mode } = snap;
  const pk = paceOf(snap);
  const pu = pacePer(pk, unit);
  const dU = toUnit(km, unit);
  const uName = unit === "km" ? t("unitKm") : t("unitMi");
  const perU = unit === "km" ? t("perKm") : t("perMi");
  const kmName = t("unitKm");
  const given = tv("given");
  const kmh = 3600 / pk;

  // ── Mode-specific first group ──
  let first: LiveTableGroup;
  let title: string;
  let action: ReactNode = null;
  if (mode === "calculator") {
    const sf = snap.solveFor ?? "time";
    first = {
      title: tv("groupInputs"),
      rows: [
        { label: t("distanceLabel"), formula: sf === "distance" ? `${clock(sec)} ÷ ${clock(pu)}` : given, value: n2(dU), unit: uName, emphasize: sf === "distance" },
        { label: t("timeLabel"), formula: sf === "time" ? `${n2(dU)} × ${clock(pu)}` : given, value: clock(sec), emphasize: sf === "time" },
        { label: unit === "km" ? tForm("paceLabelKm") : tForm("paceLabelMi"), formula: sf === "pace" ? `${clock(sec)} ÷ ${n2(dU)}` : given, value: clock(pu), unit: perU, emphasize: sf === "pace" },
      ],
    };
    title = t("heading");
    const heroValue = sf === "pace" ? `${clock(pu)} ${perU}` : sf === "time" ? clock(sec) : `${n2(dU)} ${uName}`;
    action = (
      <PaceShareExportModal
        inputRows={[
          { label: t("distanceLabel"), value: `${n2(dU)} ${uName}` },
          { label: t("timeLabel"), value: clock(sec) },
        ]}
        resultRows={[
          { label: t("paceLabelKm"), value: `${clock(pk)} ${t("perKm")}` },
          { label: t("paceLabelMi"), value: `${clock(pk * KM_PER_MILE)} ${t("perMi")}` },
          { label: t("speedKmh"), value: `${n2(kmh)} ${t("kmh")}` },
          { label: t("speedMph"), value: `${n2(kmh / KM_PER_MILE)} ${t("mph")}` },
        ]}
        heroLabel={t(`solvedFor.${sf}`)}
        heroValue={heroValue}
        sentence={t("sentence", { distance: n2(dU), unit: uName, pace: clock(pk), time: clock(sec) })}
      />
    );
  } else if (mode === "finish-time") {
    const tKm = snap.targetKm ?? km;
    const pred = snap.predictedSec ?? sec;
    first = {
      title: tv("groupInputs"),
      rows: [
        { label: tFinish("knownDistanceLabel"), formula: given, value: n2(dU), unit: uName },
        { label: tFinish("knownTimeLabel"), formula: given, value: clock(sec) },
        { label: tFinish("targetDistanceLabel"), formula: given, value: n2(toUnit(tKm, unit)), unit: uName },
        { label: tFinish("predictedTime"), formula: `${clock(sec)} × (${n2(toUnit(tKm, unit))} ÷ ${n2(dU)})^${RIEGEL}`, value: clock(pred), emphasize: true },
        { label: tv("predictedPace"), formula: `${clock(pred)} ÷ ${n2(toUnit(tKm, unit))}`, value: clock(pacePer(pred / tKm, unit)), unit: perU, emphasize: true },
      ],
    };
    title = tFinish("resultHeading");
    action = <CopyButton text={clock(pred)} className="!text-white dark:!text-white" />;
  } else if (mode === "converter") {
    const other = unit === "km" ? "mi" : "km";
    const conv = pacePer(pk, other);
    const perOther = other === "km" ? t("perKm") : t("perMi");
    first = {
      title: tv("groupInputs"),
      rows: [
        { label: tConv("paceValueLabel"), formula: given, value: clock(pu), unit: perU },
        { label: tConv("resultHeading"), formula: `${clock(pu)} ${unit === "km" ? "×" : "÷"} ${KM_PER_MILE}`, value: clock(conv), unit: perOther, emphasize: true },
        { label: tv("refDistance"), formula: tv("assumed"), value: n2(REF_KM), unit: kmName },
      ],
    };
    title = tConv("resultHeading");
    action = <CopyButton text={`${clock(conv)} ${perOther}`} className="!text-white dark:!text-white" />;
  } else {
    first = {
      title: tv("groupInputs"),
      rows: [
        { label: tMulti("overallDistance"), formula: "Σ", value: n2(dU), unit: uName },
        { label: tMulti("overallTime"), formula: "Σ", value: clock(sec) },
        { label: tv("overallPace"), formula: `${clock(sec)} ÷ ${n2(dU)}`, value: clock(pu), unit: perU, emphasize: true },
      ],
    };
    title = tMulti("resultHeading");
  }

  const groups: LiveTableGroup[] = [first];
  if (mode === "multipoint" && snap.segments?.length) {
    const paces = snap.segments.map((s) => s.sec / s.km);
    const fast = Math.min(...paces);
    groups.push({
      title: tv("groupSegments"),
      rows: snap.segments.map((s, i): LiveTableRow => ({
        label: `${s.from + 1} → ${s.to + 1} · ${n2(toUnit(s.km, unit))} ${uName}`,
        formula: `${clock(s.sec)} ÷ ${n2(toUnit(s.km, unit))}`,
        value: clock(pacePer(paces[i], unit)),
        unit: perU,
        emphasize: paces[i] === fast,
      })),
    });
  }
  groups.push(
    {
      title: tv("groupPace"),
      rows: [
        { label: t("paceLabelKm"), formula: `${clock(sec)} ÷ ${n3(km)}`, value: clock(pk), unit: t("perKm") },
        { label: t("paceLabelMi"), formula: `${clock(pk)} × ${KM_PER_MILE}`, value: clock(pk * KM_PER_MILE), unit: t("perMi") },
        { label: tv("per400"), formula: `${clock(pk)} × 0.4`, value: clock(pk * 0.4) },
        { label: tv("per100"), formula: `${clock(pk)} × 0.1`, value: clock(pk * 0.1) },
      ],
    },
    {
      title: tv("groupSpeed"),
      rows: [
        { label: t("speedKmh"), formula: `3600 ÷ ${Math.round(pk)} s`, value: n2(kmh), unit: t("kmh") },
        { label: t("speedMph"), formula: `${n2(kmh)} ÷ ${KM_PER_MILE}`, value: n2(kmh / KM_PER_MILE), unit: t("mph") },
        { label: tv("mps"), formula: `1000 ÷ ${Math.round(pk)} s`, value: n2(1000 / pk), unit: "m/s" },
      ],
    },
    {
      title: tv("groupCheckpoints"),
      rows: [25, 50, 75, 100].map((pct) => ({
        label: tv("checkpoint", { pct }),
        formula: `${n2(toUnit((km * pct) / 100, unit))} ${uName} × ${clock(pu)}`,
        value: clock((sec * pct) / 100),
      })),
    },
    {
      title: tv("groupEven"),
      rows: MAIN_RACES.map((r) => ({ label: tRace(r.key), formula: `${n3(r.km)} × ${clock(pk)}`, value: clock(r.km * pk) })),
    },
    {
      title: tv("groupRiegel"),
      rows: MAIN_RACES.map((r) => ({
        label: tRace(r.key),
        formula: `${clock(sec)} × (${n3(r.km)} ÷ ${n3(km)})^${RIEGEL}`,
        value: clock(riegel(km, sec, r.km)),
        emphasize: snap.targetKm !== undefined && Math.abs(snap.targetKm - r.km) < 0.01,
      })),
    },
  );

  const lapText = `400 m ${clock(pk * 0.4)}`;
  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { pace: `${clock(pk)} ${t("perKm")}`, lap: clock(pk * 0.4) })}
      drawing={
        <Scene3D className="min-h-0!" camera={[0, 3.4, 4.2]}>
          <PaceTrackScene3D
            secPerKm={pk}
            title={`${clock(pu)} /${unit} · ${n2(unit === "km" ? kmh : kmh / KM_PER_MILE)} ${unit === "km" ? "km/h" : "mph"}`}
            lap={lapText}
            splits={[100, 200, 300, 400].map((m) => `${m} m ${clock((pk * m) / 1000)}`)}
          />
        </Scene3D>
      }
    />
  );

  return (
    <SectionCard phoneRole="output"
      title={title}
      className={fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}
      bodyClassName={fill ? "p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6" : undefined}
      action={action}
    >
      {invalid && (
        <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {mode === "multipoint" ? tMulti("noSegments") : t("invalidInput")}
        </p>
      )}
      <div ref={wrapRef} className={fill ? "lg:flex lg:flex-1 lg:flex-col" : undefined}>
        {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
      </div>
    </SectionCard>
  );
}
