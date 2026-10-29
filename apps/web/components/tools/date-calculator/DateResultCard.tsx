"use client";
import { useLocale, useTranslations } from "next-intl";
import { civilWeekday, isLeapYear } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import DateMonthGrid from "./DateMonthGrid";
import DateShareExportModal from "./DateShareExportModal";
import type { Derived, Formatters } from "./dateModel";

type Props = { d: Derived; f: Formatters; amountText: string; summary: string };

export function useYmd(f: Formatters) {
  const t = useTranslations("tools.date-calculator.pro");
  return (a: { years: number; months: number; days: number }) => t("ymd", { y: f.int(a.years), m: f.int(a.months), d: f.int(a.days) });
}

export default function DateResultCard({ d, f, amountText, summary }: Props) {
  const t = useTranslations("tools.date-calculator.pro");
  const locale = useLocale();
  const ymd = useYmd(f);
  const { span: s, add } = d;
  const b = s.business;
  const isAdd = d.mode === "add" && !!add;
  const dual = (c: typeof d.start) => `${f.greg(c)} · ${f.hijri(c)}`;

  const dates: LiveTableGroup = {
    title: t("result.groupDates"),
    rows: [
      { label: isAdd ? t("input.base") : t("input.start"), formula: f.weekday(civilWeekday(d.start)), value: f.greg(d.start) },
      { label: t("result.hijriOf", { what: isAdd ? t("input.base") : t("input.start") }), formula: f.iso(d.start), value: f.hijri(d.start) },
      { label: isAdd ? t("result.resultDate") : t("input.end"), formula: f.weekday(civilWeekday(d.target)), value: f.greg(d.target), emphasize: isAdd },
      { label: t("result.hijriOf", { what: isAdd ? t("result.resultDate") : t("input.end") }), formula: f.iso(d.target), value: f.hijri(d.target), emphasize: isAdd },
    ],
  };

  const addGroup: LiveTableGroup[] = isAdd
    ? [
        {
          title: t("result.groupAdd"),
          rows: [
            { label: t("result.operation"), formula: `${f.iso(d.start)} ${add.daysMoved < 0 ? "−" : "+"} ${amountText}`, value: f.iso(add.result), emphasize: true },
            { label: t("result.daysMoved"), formula: `${f.iso(add.result)} − ${f.iso(d.start)}`, value: f.int(add.daysMoved) },
            ...(add.month
              ? [
                  {
                    label: t("result.monthEnd"),
                    formula: t("result.monthEndFormula", { req: f.int(add.month.requestedDay), len: f.int(add.month.monthLength) }),
                    value: add.month.clamped ? t("result.clampedTo", { day: f.int(add.month.date.day) }) : t("result.notClamped"),
                  },
                  {
                    label: t("result.leapYear", { y: f.int(add.result.year) }),
                    formula: t("result.leapRule"),
                    value: add.month.leapTarget ? t("result.yes") : t("result.no"),
                  },
                ]
              : []),
            ...(d.add && (add.skippedWeekend || add.skippedHolidays)
              ? [
                  { label: t("result.skippedWeekend"), formula: t(`weekend.${d.weekend}`), value: f.int(add.skippedWeekend) },
                  { label: t("result.skippedHolidays"), formula: t("result.listed", { n: f.int(d.holidays.length) }), value: f.int(add.skippedHolidays) },
                ]
              : []),
          ],
        },
      ]
    : [];

  const groups: LiveTableGroup[] = [
    ...(isAdd ? [dates, ...addGroup] : [dates]),
    {
      title: t("result.groupSpan"),
      rows: [
        {
          label: t("result.totalDays"),
          formula: `${f.iso(s.later)} − ${f.iso(s.earlier)}${s.includeEnd ? " + 1" : ""}`,
          value: f.int(s.totalDays),
          emphasize: !isAdd,
        },
        { label: t("result.weeks"), formula: `${f.int(s.totalDays)} ÷ 7`, value: t("result.weeksDays", { w: f.int(s.weeks), d: f.int(s.weekRemainderDays) }) },
        { label: t("cal.gregorian"), formula: t("result.ymdFormula"), value: ymd(s.ymd), emphasize: !isAdd },
        { label: t("cal.hijri"), formula: t("result.hijriFormula"), value: ymd(s.hijri) },
        { label: t("result.leapDays"), formula: t("result.feb29"), value: f.int(s.leapDays) },
      ],
    },
    {
      title: t("result.groupBusiness", { weekend: t(`weekend.${d.weekend}`) }),
      rows: [
        { label: t("result.calendarDays"), formula: s.includeEnd ? t("input.includeEnd") : t("result.endExcluded"), value: f.int(b.calendarDays) },
        { label: t("result.weekendDays"), formula: t(`weekend.${d.weekend}`), value: `− ${f.int(b.weekendDays)}` },
        {
          label: t("result.holidays"),
          formula: t("result.holidaysNote", { n: f.int(d.holidays.length), w: f.int(s.holidaysOnWeekend) }),
          value: `− ${f.int(b.holidays)}`,
        },
        { label: t("result.businessDays"), formula: `${f.int(b.calendarDays)} − ${f.int(b.weekendDays)} − ${f.int(b.holidays)}`, value: f.int(b.businessDays), emphasize: true },
      ],
    },
    ...(isAdd ? [] : addGroup),
  ];

  const tiles = isAdd
    ? [
        { k: t("result.resultDate"), v: f.greg(d.target), c: "text-blue-700 dark:text-blue-300" },
        { k: t("cal.hijri"), v: f.hijri(d.target), c: "text-emerald-700 dark:text-emerald-300" },
        { k: t("result.daysMoved"), v: f.int(add.daysMoved), c: "text-amber-700 dark:text-amber-300" },
      ]
    : [
        { k: t("cal.gregorian"), v: t("ymdShort", { y: f.int(s.ymd.years), m: f.int(s.ymd.months), d: f.int(s.ymd.days) }), c: "text-blue-700 dark:text-blue-300" },
        { k: t("result.totalDays"), v: f.int(s.totalDays), c: "text-emerald-700 dark:text-emerald-300" },
        { k: t("result.businessDays"), v: f.int(b.businessDays), c: "text-amber-700 dark:text-amber-300" },
      ];

  const inputRows = [
    { label: isAdd ? t("input.base") : t("input.start"), value: dual(d.start) },
    isAdd ? { label: t("result.operation"), value: amountText } : { label: t("input.end"), value: dual(d.target) },
    { label: t("input.weekend"), value: t(`weekend.${d.weekend}`) },
  ];
  const resultRows = isAdd
    ? [
        { label: t("result.resultDate"), value: dual(d.target) },
        { label: t("result.daysMoved"), value: f.int(add.daysMoved) },
      ]
    : [
        { label: t("cal.gregorian"), value: ymd(s.ymd) },
        { label: t("cal.hijri"), value: ymd(s.hijri) },
        { label: t("result.totalDays"), value: f.int(s.totalDays) },
        { label: t("result.businessDays"), value: f.int(b.businessDays) },
      ];

  return (
    <SectionCard phoneRole="output"
      title={t("result.title")}
      action={<DateShareExportModal inputRows={inputRows} resultRows={resultRows} heroLabel={t("result.title")} heroValue={tiles[0].v} sentence={summary} />}
      className="lg:flex lg:flex-1 lg:flex-col"
      bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col"
    >
      <div className="mb-3 grid grid-cols-3 gap-2 text-center" data-bp-inner>
        {tiles.map((x) => (
          <div key={x.k} className="rounded-lg bg-blue-50 px-1 py-1.5 dark:bg-blue-500/10">
            <p className="text-xs leading-3 font-semibold text-zinc-500 dark:text-zinc-400">{x.k}</p>
            <p dir="auto" className={`mt-0.5 text-sm font-bold ${x.c}`}>{x.v}</p>
          </div>
        ))}
      </div>
      <LiveTableFill>
        <LiveTable3DLayout
          headings={[t("result.colItem"), t("result.colCalc"), t("result.colValue")]}
          groups={groups}
          drawing={
            <DateMonthGrid
              focus={d.target}
              from={s.earlier}
              toExclusive={s.endExclusive}
              weekend={d.weekend}
              holidays={d.holidays}
              rtl={locale.startsWith("ar")}
              f={f}
            />
          }
          caption={t("result.gridCaption", {
            year: f.int(d.target.year),
            leap: isLeapYear(d.target.year) ? t("result.leapYes") : t("result.leapNo"),
          })}
        />
      </LiveTableFill>
    </SectionCard>
  );
}
