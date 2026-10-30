"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { ltr } from "@/components/tool-ui/MixedText";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import OvulationShareExportModal from "./OvulationShareExportModal";
import { useDateFmt } from "./OvulationLiveContext";
import { FW_AFTER, FW_BEFORE, phaseOf, wilcoxOf, type OvSnap } from "./ovulation";
import type { OvulationCalculatorError } from "./types";
import { useSnapTableRows } from "../ideal-weight-calculator/useSnapTableRows";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const OvulationWheelScene3D = dynamic(() => import("./OvulationWheelScene3D"), { ssr: false });

type Props = {
  /** The last valid result. */
  snap: OvSnap;
  /** The calculator's error for the current (invalid) input; the last good result stays on screen. */
  error: OvulationCalculatorError | null;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

const pct = (p: number) => (p * 100).toFixed(0);
const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");

/** Result card: next ovulation up top, then the deep live table on the left and the 3D cycle wheel on the right. */
export default function OvulationResult({ snap, error, fill = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useSnapTableRows(wrapRef);
  const t = useTranslations("tools.ovulation-calculator.result");
  const tForm = useTranslations("tools.ovulation-calculator.form");
  const tv = useTranslations("tools.ovulation-calculator.visuals.result");
  const tc = useTranslations("tools.ovulation-calculator.visuals.common");
  const f = useDateFmt();

  const { lmp, cycle, luteal, today, cycles, ovOffset, dayIdx } = snap;
  const c1 = cycles[0];
  const d = tc("abbr.d");
  const A = tc("abbr.lmp");
  const O = tc("abbr.ov");
  const NP = tc("abbr.next");
  const TD = tc("abbr.today");
  const phase = phaseOf(dayIdx, ovOffset);
  const relToday = dayIdx - ovOffset;
  const chanceToday = wilcoxOf(relToday);
  const fwText = (c: (typeof cycles)[number]) => `${f.short(c.fwStart)} – ${f.short(c.fwEnd)}`;

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: tForm("lastPeriodDate"), formula: tv("given"), value: f.long(lmp) },
        { label: tForm("cycleLengthDays"), formula: tv("given"), value: String(cycle), unit: d },
        { label: tForm("lutealPhaseDays"), formula: tv("given"), value: String(luteal), unit: d },
        { label: tv("today"), formula: tv("given"), value: f.long(today) },
      ],
    },
    {
      title: tv("groupCycle1"),
      rows: [
        { label: t("nextPeriod"), formula: `${A} + ${cycle} ${d}`, value: f.long(c1.next) },
        { label: t("ovulationDay"), formula: `${NP} − ${luteal} ${d}`, value: f.long(c1.ov), emphasize: true },
        { label: tv("follicular"), formula: `${cycle} − ${luteal}`, value: String(ovOffset), unit: d },
        { label: tv("ovCycleDay"), formula: `${ovOffset} + 1`, value: String(ovOffset + 1) },
        { label: tv("fwStart"), formula: `${O} − ${FW_BEFORE} ${d}`, value: f.long(c1.fwStart) },
        { label: tv("fwEnd"), formula: `${O} + ${FW_AFTER} ${d}`, value: f.long(c1.fwEnd) },
        { label: tv("fwLength"), formula: `${FW_BEFORE} + 1 + ${FW_AFTER}`, value: String(c1.fwEnd - c1.fwStart + 1), unit: d },
        { label: tv("peak"), formula: `${O} − 2 … ${O}`, value: `${f.short(c1.ov - 2)} – ${f.short(c1.ov)}`, emphasize: true },
      ],
    },
    {
      title: tv("groupToday"),
      rows: [
        { label: tv("cycleDayToday"), formula: `(${TD} − ${A}) mod ${cycle} + 1`, value: String(dayIdx + 1) },
        { label: tv("phaseToday"), formula: `${signed(relToday)} ${d} ↔ ${O}`, value: tc(`phases.${phase}`), emphasize: true },
        { label: tv("chanceToday"), formula: tv("wilcox"), value: pct(chanceToday), unit: "%" },
        { label: tv("toOvulation"), formula: `${O} − ${TD}`, value: signed(c1.ov - today), unit: d },
        { label: tv("toFertile"), formula: `${tc("abbr.fw")} − ${TD}`, value: signed(c1.fwStart - today), unit: d },
        { label: tv("toPeriod"), formula: `${NP} − ${TD}`, value: signed(c1.next - today), unit: d },
      ],
    },
    ...cycles.slice(1).map((c) => ({
      title: t("cycle", { n: c.n }),
      rows: [
        { label: t("ovulationDay"), formula: `${A} + ${c.n * cycle - luteal} ${d}`, value: f.long(c.ov), emphasize: true },
        { label: t("fertileWindow"), formula: `${O} − ${FW_BEFORE} … ${O} + ${FW_AFTER}`, value: fwText(c) },
        { label: t("nextPeriod"), formula: `${A} + ${c.n * cycle} ${d}`, value: f.long(c.next) },
      ],
    })),
    {
      title: tv("groupChance"),
      rows: [-5, -4, -3, -2, -1, 0, 1].map((r) => ({
        label: `${O} ${signed(r)} ${d} · ${f.short(c1.ov + r)}`,
        formula: tv("wilcox"),
        value: pct(wilcoxOf(r)),
        unit: "%",
        emphasize: r === relToday,
      })),
    },
  ];

  const ovText = f.long(c1.ov);
  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { day: ltr(String(dayIdx + 1)), cycle: ltr(String(cycle)), phase: tc(`phases.${phase}`), ov: ltr(String(ovOffset + 1)) })}
      drawing={
        <Scene3D className="min-h-0!" camera={[0, 3.3, 2.7]}>
          <OvulationWheelScene3D cycle={cycle} ovOffset={ovOffset} todayIdx={dayIdx} ovLabel={f.num(c1.ov)} todayLabel={f.num(today)} />
        </Scene3D>
      }
    />
  );

  return (
    <SectionCard phoneRole="output"
      title={t("heading")}
      className={fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}
      bodyClassName={fill ? "p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6" : undefined}
      action={
        <OvulationShareExportModal
          inputRows={cycles.map((c) => ({ label: t("cycle", { n: c.n }), value: `${t("ovulationDay")} ${f.long(c.ov)}` }))}
          resultRows={cycles.map((c) => ({ label: t("fertileWindow"), value: `${f.long(c.fwStart)} - ${f.long(c.fwEnd)}` }))}
          heroLabel={t("nextOvulation")}
          heroValue={ovText}
          sentence={t("sentence", { date: ovText })}
        />
      }
    >
      {error && (
        <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {t(`errors.${error}`)}
        </p>
      )}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("nextOvulation")}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{ovText}</p>
        </div>
        <div className="flex gap-2 text-center">
          <div className="rounded-lg bg-emerald-50 px-2.5 py-1 dark:bg-emerald-500/10">
            <p dir="ltr" className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
              {fwText(c1)}
            </p>
            <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{t("fertileWindow")}</p>
          </div>
          <div className="rounded-lg bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
            <p dir="ltr" className="text-sm font-bold tabular-nums text-zinc-800 dark:text-zinc-100">
              {f.short(c1.next)}
            </p>
            <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{t("nextPeriod")}</p>
          </div>
        </div>
      </div>
      <div ref={wrapRef} className={fill ? "lg:flex lg:flex-1 lg:flex-col" : undefined}>
        {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
      </div>
    </SectionCard>
  );
}
