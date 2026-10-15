"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { ltr } from "@/components/tool-ui/MixedText";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import SleepShareExportModal from "./SleepShareExportModal";
import { ADULT_INDEX, AGE_GROUPS, CYCLE_MIN, DAY, OPTION_COLORS, STAGES, WIND_DOWN, ageVerdict, clock, stageTotals, wrap, type SleepSnapshot } from "./sleep";
import type { SleepCalculatorError } from "./types";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const SleepNightScene3D = dynamic(() => import("./SleepNightScene3D"), { ssr: false });

type Props = {
  /** The last valid result. */
  snap: SleepSnapshot;
  /** The calculator's error for the current (invalid) input; the last good result stays on screen. */
  error: SleepCalculatorError | null;
  digitStyle: DigitStyle;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

export default function SleepResult({ snap, error, digitStyle, fill = false }: Props) {
  const t = useTranslations("tools.sleep-calculator.result");
  const tForm = useTranslations("tools.sleep-calculator.form");
  const tModes = useTranslations("tools.sleep-calculator.modes");
  const tv = useTranslations("tools.sleep-calculator.visuals.result");
  const tc = useTranslations("tools.sleep-calculator.visuals.common");
  const n0 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });
  const n1 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });
  const n2 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const { mode, anchor, latency, nights } = snap;
  const wakeUp = mode === "wakeUp";
  const heading = wakeUp ? t("headingBedtimes") : t("headingWakeUpTimes");
  const best = nights[0];
  const adult = AGE_GROUPS[ADULT_INDEX];
  const stages = stageTotals(best.cycles);
  const inBed = best.sleepMinutes + latency;

  const inputRows = [
    { label: tModes("groupLabel"), value: tModes(`labels.${mode}`) },
    { label: wakeUp ? tForm("wakeUpTime") : tForm("bedtime"), value: clock(anchor) },
    { label: tForm("fallAsleepMinutes"), value: `${latency} min` },
  ];
  const resultRows = nights.map((o) => ({
    label: t("cyclesCount", { count: o.cycles }),
    value: `${clock(o.clockMinutes)} (${t("sleepDuration", { hours: (o.sleepMinutes / 60).toFixed(1) })})`,
  }));
  const sentence = t("sentence", { time: clock(best.clockMinutes), hours: (best.sleepMinutes / 60).toFixed(1) });

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: tModes("groupLabel"), formula: tv("given"), value: tModes(`labels.${mode}`) },
        { label: wakeUp ? tForm("wakeUpTime") : tForm("bedtime"), formula: tv("given"), value: clock(anchor) },
        { label: tForm("fallAsleepMinutes"), formula: tv("given"), value: n0(latency), unit: "min" },
        { label: tv("cycleLength"), formula: tv("standard"), value: n0(CYCLE_MIN), unit: "min" },
      ],
    },
    {
      title: heading,
      rows: nights.map((o) => ({
        label: t("cyclesCount", { count: o.cycles }),
        formula: wakeUp ? `${clock(anchor)} − ${latency} − ${o.cycles} × 90` : `${clock(anchor)} + ${latency} + ${o.cycles} × 90`,
        value: clock(o.clockMinutes),
        emphasize: o.cycles >= 5,
      })),
    },
    {
      title: tv("groupAsleep"),
      rows: nights.map((o) => ({
        label: t("cyclesCount", { count: o.cycles }),
        formula: `${o.cycles} × 90 = ${o.sleepMinutes} min`,
        value: n2(o.sleepMinutes / 60),
        unit: "h",
      })),
    },
    {
      title: tv("groupNight", { count: best.cycles }),
      rows: [
        { label: tv("inBed"), formula: wakeUp ? `${clock(anchor)} − ${inBed} min` : tv("given"), value: clock(best.bed) },
        { label: tv("asleepAt"), formula: `${clock(best.bed)} + ${latency} min`, value: clock(best.onset) },
        { label: tv("wakeAt"), formula: `${clock(best.onset)} + ${best.sleepMinutes} min`, value: clock(best.wake), emphasize: true },
        { label: tv("timeInBed"), formula: `${best.sleepMinutes} + ${latency}`, value: n2(inBed / 60), unit: "h" },
        { label: tv("efficiency"), formula: `${best.sleepMinutes} ÷ ${inBed}`, value: n1((best.sleepMinutes / inBed) * 100), unit: "%" },
        { label: tv("awakeWindow"), formula: `24 h − ${n2(inBed / 60)} h`, value: n2((DAY - inBed) / 60), unit: "h" },
      ],
    },
    {
      title: tv("groupStages"),
      rows: STAGES.map((k) => ({
        label: tc(`stageLong.${k}`),
        formula: `${stages[k]} ÷ ${best.sleepMinutes}`,
        value: `${n0(stages[k])} min · ${n0((stages[k] / best.sleepMinutes) * 100)}%`,
        emphasize: k === "n3" || k === "rem",
      })),
    },
    {
      title: tv("groupAge"),
      rows: nights.map((o) => {
        const v = ageVerdict(adult, o.sleepMinutes / 60);
        return {
          label: t("cyclesCount", { count: o.cycles }),
          formula: `${n2(o.sleepMinutes / 60)} h vs 7–9 h`,
          value: `${tc(`verdict.${v}`)} ${v === "rec" ? "✓" : v === "may" ? "~" : "✗"}`,
          emphasize: v === "rec",
        };
      }),
    },
    {
      title: tv("groupWindDown"),
      rows: WIND_DOWN.map((w) => ({
        label: tc(`stations.${w.key}`),
        formula: w.at === 0 ? tv("given") : `${clock(best.bed)} − ${-w.at / 60} h`,
        value: clock(wrap(best.bed + w.at)),
        emphasize: w.key === "bed",
      })),
    },
  ];

  const rings = nights.map((o) => ({
    cycles: o.cycles,
    color: OPTION_COLORS[o.cycles],
    bed: o.bed,
    onset: o.onset,
    wake: o.wake,
    label: `${o.cycles}× · ${clock(o.clockMinutes)}`,
  }));

  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { time: ltr(clock(anchor)) })}
      drawing={
        <Scene3D camera={[0, 3.4, 3.3]}>
          <SleepNightScene3D rings={rings} anchor={anchor} anchorLabel={clock(anchor)} />
        </Scene3D>
      }
    />
  );

  return (
    <SectionCard
      title={heading}
      className={fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}
      bodyClassName={fill ? "p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6" : undefined}
      action={<SleepShareExportModal inputRows={inputRows} resultRows={resultRows} heroLabel={heading} heroValue={clock(best.clockMinutes)} sentence={sentence} />}
    >
      {error && (
        <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {t(`errors.${error}`)}
        </p>
      )}
      {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
    </SectionCard>
  );
}
