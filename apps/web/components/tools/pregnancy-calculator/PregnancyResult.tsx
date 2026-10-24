"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { ltr } from "@/components/tool-ui/MixedText";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import PregnancyShareExportModal from "./PregnancyShareExportModal";
import { ACOG_TRI, FULL_TERM, acogTrimester, addDaysISO, diffDays, fmtDate, naegeleISO, sgn, uterusCm, wd, type PregSnapshot } from "./preg";
import type { PregnancyCalculatorError } from "./types";
import { useSnapTableRows } from "../ideal-weight-calculator/useSnapTableRows";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const PregnancyWombScene3D = dynamic(() => import("./PregnancyWombScene3D"), { ssr: false });

type Props = {
  /** The last valid result. */
  snap: PregSnapshot;
  /** The calculator's error for the current (invalid) input; the last good result stays on screen. */
  error: PregnancyCalculatorError | null;
  digitStyle: DigitStyle;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

export default function PregnancyResult({ snap, error, digitStyle, fill = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useSnapTableRows(wrapRef);
  const t = useTranslations("tools.pregnancy-calculator.result");
  const tForm = useTranslations("tools.pregnancy-calculator.form");
  const tSize = useTranslations("tools.pregnancy-calculator.sizeComparisons");
  const tp = useTranslations("tools.pregnancy-calculator");
  const tv = useTranslations("tools.pregnancy-calculator.visuals.result");
  const tc = useTranslations("tools.pregnancy-calculator.visuals.common");
  const locale = useLocale();
  const n0 = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 0 });
  const n1 = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 1 });
  const n2 = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 2 });
  const date = (iso: string) => fmtDate(iso, locale);

  const { lmp, today, ga, weeks, days, trimester, due, daysUntilDue, percent, milestone } = snap;
  const weekValue = t("weekValue", { weeks, days });
  const acog = acogTrimester(ga);
  const triEnd = ACOG_TRI[acog - 1].to;
  const naegele = naegeleISO(lmp);
  const naegeleDiff = diffDays(due, naegele);
  const fundus = weeks >= 20 && weeks <= 36;

  const inputRows = [{ label: t("week"), value: weekValue }];
  const resultRows = [
    { label: t("dueDate"), value: date(due) },
    { label: t("daysUntilDue"), value: `${daysUntilDue}` },
  ];
  const sentence = t("sentence", { weeks: weekValue, dueDate: date(due) });

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: tForm("lastPeriodDate"), formula: tv("given"), value: date(lmp) },
        { label: tv("today"), formula: tv("given"), value: date(today) },
        { label: tv("cycle"), formula: tv("assumed"), value: n0(28), unit: "d" },
        { label: tv("fullTerm"), formula: tv("standard"), value: n0(FULL_TERM), unit: "d" },
      ],
    },
    {
      title: tv("groupAge"),
      rows: [
        { label: tv("totalDays"), formula: tv("todayMinusLmp"), value: n0(ga), unit: "d" },
        { label: t("week"), formula: `⌊${ga} ÷ 7⌋ , ${ga} mod 7`, value: weekValue, emphasize: true },
        { label: tv("decimalWeeks"), formula: `${ga} ÷ 7`, value: n2(ga / 7), unit: "w" },
        { label: tv("months"), formula: `${ga} ÷ 30.44`, value: n1(ga / 30.44), unit: "mo" },
        { label: tv("fetalAge"), formula: `${ga} − 14`, value: ga >= 14 ? wd(ga - 14) : tv("beforeConception") },
        { label: tv("percent"), formula: `${ga} ÷ 280`, value: n1(percent), unit: "%" },
      ],
    },
    {
      title: tv("groupDue"),
      rows: [
        { label: t("dueDate"), formula: tv("lmpPlus280"), value: date(due), emphasize: true },
        { label: tv("naegele"), formula: tv("naegeleFormula"), value: date(naegele) },
        { label: tv("difference"), formula: tv("naegeleMinus280"), value: sgn(naegeleDiff), unit: "d" },
        { label: t("daysUntilDue"), formula: `280 − ${ga}`, value: n0(daysUntilDue), unit: "d" },
        { label: tv("weeksLeft"), formula: `${daysUntilDue} ÷ 7`, value: daysUntilDue >= 0 ? wd(daysUntilDue) : sgn(daysUntilDue) + " d" },
      ],
    },
    {
      title: tv("groupTrimester"),
      rows: [
        { label: tv("trimesterAcog"), formula: tv("acogRule"), value: t("trimesterValue", { n: trimester }), emphasize: true },
        ...(acog < 3
          ? [
              { label: tv("trimesterLeft"), formula: `${triEnd} − ${ga}`, value: n0(triEnd - ga), unit: "d" },
              { label: tv("nextTrimester", { n: acog + 1 }), formula: `LMP + ${triEnd} d`, value: date(addDaysISO(lmp, triEnd)) },
            ]
          : [{ label: tv("trimesterLeft"), formula: `280 − ${ga}`, value: n0(Math.max(0, FULL_TERM - ga)), unit: "d" }]),
      ],
    },
    {
      title: tv("groupKeyDates"),
      rows: [
        { label: tc("stations.conception"), formula: "LMP + 14 d", value: date(addDaysISO(lmp, 14)) },
        { label: tc("stations.endT1"), formula: "LMP + 13w 6d", value: date(addDaysISO(lmp, 97)) },
        { label: tc("stations.anatomy"), formula: "LMP + 18–22 w", value: `${fmtDate(addDaysISO(lmp, 126), locale, true)} – ${fmtDate(addDaysISO(lmp, 154), locale, true)}` },
        { label: tc("stations.startT3"), formula: "LMP + 28w 0d", value: date(addDaysISO(lmp, 196)) },
        { label: tc("stations.earlyTerm"), formula: "LMP + 37w 0d", value: date(addDaysISO(lmp, 259)) },
        { label: tc("stations.fullTerm"), formula: "LMP + 39w 0d", value: date(addDaysISO(lmp, 273)) },
        { label: tc("stations.lateTerm"), formula: "LMP + 41w 0d", value: date(addDaysISO(lmp, 287)) },
        { label: tc("stations.postTerm"), formula: "LMP + 42w 0d", value: date(addDaysISO(lmp, 294)) },
      ],
    },
    {
      title: tv("groupWeek", { week: weeks }),
      rows: milestone
        ? [
            { label: tp("sizeComparisonIntro"), formula: tv("weekTable"), value: tSize(milestone.sizeComparison), emphasize: true },
            { label: tv("length"), formula: milestone.week < 20 ? tv("crl") : tv("chl"), value: n1(milestone.lengthCm), unit: "cm" },
            { label: tv("weight"), formula: tv("weekTable"), value: milestone.weightG > 0 ? n0(milestone.weightG) : "< 1", unit: "g" },
            { label: tv("uterus"), formula: fundus ? tv("fundusRule") : tv("typical"), value: n0(uterusCm(ga / 7)), unit: "cm" },
          ]
        : [{ label: tp("sizeComparisonIntro"), formula: tv("weekTable"), value: tv("tooEarly") }],
    },
  ];

  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { week: ltr(wd(ga)), length: ltr(milestone ? `${milestone.lengthCm} cm` : "< 0.2 cm") })}
      drawing={
        <Scene3D className="min-h-0!" camera={[0, 1.1, 4.2]}>
          <PregnancyWombScene3D ga={ga} lengthCm={milestone?.lengthCm ?? 0.15} weightG={milestone?.weightG ?? 0} />
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
        <PregnancyShareExportModal
          inputRows={inputRows}
          resultRows={resultRows}
          heroLabel={t("trimesterValue", { n: trimester })}
          heroValue={weekValue}
          sentence={sentence}
        />
      }
    >
      {error && (
        <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {t(`errors.${error}`)}
        </p>
      )}
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{weekValue}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t("trimesterValue", { n: trimester })} · {t("dueDate")}: <bdi className="text-zinc-800 dark:text-zinc-100">{date(due)}</bdi>
        </p>
      </div>
      <div ref={wrapRef} className={fill ? "lg:flex lg:flex-1 lg:flex-col" : undefined}>
        {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
      </div>
    </SectionCard>
  );
}
