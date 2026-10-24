"use client";
import { useTranslations } from "next-intl";
import { getChineseZodiac, getGeneration, getZodiacSign } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import AgeDualDial from "./AgeDualDial";
import AgeShareExportModal from "./AgeShareExportModal";
import { AGE_COLORS, type Derived, type Formatters } from "./ageModel";

type Props = { d: Derived; f: Formatters; ageText: string; hijriText: string };

export default function AgeResultCard({ d, f, ageText, hijriText }: Props) {
  const t = useTranslations("tools.age-calculator.dual");
  const tf = useTranslations("tools.age-calculator.aboveFold");
  const { report: r } = d;
  const g = r.gregorian;
  const h = r.hijri;
  const ymd = (a: { years: number; months: number; days: number }) => t("ymd", { y: f.int(a.years), m: f.int(a.months), d: f.int(a.days) });
  const countdown = (n: number) => (n === 0 ? t("result.today") : t("result.inDays", { n: f.int(n) }));
  const generationNames = tf.raw("generationNames") as Record<string, string>;
  const zodiacNames = tf.raw("zodiacNames") as Record<string, string>;
  const chineseNames = tf.raw("chineseZodiacNames") as Record<string, string>;

  const groups: LiveTableGroup[] = [
    {
      title: t("result.groupGregorian"),
      rows: [
        { label: t("result.birth"), formula: f.weekday(r.birthWeekday), value: f.greg(r.birth) },
        { label: t("result.reference"), formula: d.isToday ? t("input.today") : t("input.specificDate"), value: f.greg(r.reference) },
        { label: t("result.lastBirthday"), formula: t("result.turned", { n: f.int(g.years) }), value: f.greg(g.lastBirthdayGregorian) },
        { label: t("result.age"), formula: t("result.monthsSince", { n: f.int(g.totalMonths) }), value: ymd(g), emphasize: true },
        { label: t("result.decimal"), formula: `${f.int(g.years)} + ${f.int(g.daysIntoYear)} ÷ ${f.int(g.yearLengthDays)}`, value: f.num(g.decimalYears) },
      ],
    },
    ...(h
      ? [
          {
            title: t("result.groupHijri"),
            rows: [
              { label: t("result.birth"), formula: f.greg(r.birth), value: f.hijri(r.birth) },
              { label: t("result.reference"), formula: f.greg(r.reference), value: f.hijri(r.reference) },
              { label: t("result.age"), formula: t("result.monthsSince", { n: f.int(h.totalMonths) }), value: ymd(h), emphasize: true },
              { label: t("result.decimal"), formula: `${f.int(h.years)} + ${f.int(h.daysIntoYear)} ÷ ${f.int(h.yearLengthDays)}`, value: f.num(h.decimalYears) },
              { label: t("result.hijriAhead"), formula: `${f.num(h.decimalYears)} − ${f.num(g.decimalYears)}`, value: f.num(r.hijriYearsAhead) },
            ],
          },
        ]
      : []),
    {
      title: t("result.groupNext"),
      rows: [
        { label: t("result.nextGregorian", { n: f.int(g.turning) }), formula: f.weekday((r.referenceWeekday + g.daysUntilNext) % 7), value: f.greg(g.nextBirthdayGregorian) },
        { label: t("result.countdown"), formula: `${f.greg(r.reference)} → ${f.greg(g.nextBirthdayGregorian)}`, value: countdown(g.daysUntilNext), emphasize: true },
        ...(h
          ? [
              { label: t("result.nextHijri", { n: f.int(h.turning) }), formula: f.greg(h.nextBirthdayGregorian), value: f.hijri(h.nextBirthdayGregorian) },
              { label: t("result.countdown"), formula: `${f.greg(r.reference)} → ${f.greg(h.nextBirthdayGregorian)}`, value: countdown(h.daysUntilNext), emphasize: true },
            ]
          : []),
        ...(r.isLeapDayBirth
          ? [{ label: t("result.leapRule"), formula: t("result.leapDaysLived", { n: f.int(r.leapDaysLived) }), value: r.leapRule === "feb28" ? t("input.leapFeb28") : t("input.leapMar1") }]
          : []),
      ],
    },
    {
      title: t("result.groupLived"),
      rows: [
        { label: t("result.days"), formula: `${f.iso(r.reference)} − ${f.iso(r.birth)}`, value: f.int(r.totalDays), emphasize: true },
        { label: t("result.weeks"), formula: `${f.int(r.totalDays)} ÷ 7`, value: t("result.weeksDays", { w: f.int(r.totalWeeks), d: f.int(r.weekRemainderDays) }) },
        { label: t("result.hours"), formula: `${f.int(r.totalDays)} × 24`, value: f.int(r.totalHours) },
        { label: t("result.minutes"), formula: `${f.int(r.totalHours)} × 60`, value: f.int(r.totalMinutes) },
        { label: t("result.leapDays"), formula: t("result.feb29s"), value: f.int(r.leapDaysLived) },
      ],
    },
    {
      title: t("result.groupBirth"),
      rows: [
        { label: t("result.bornOn"), formula: f.iso(r.birth), value: f.weekday(r.birthWeekday) },
        { label: tf("generationLabel"), formula: String(r.birth.year), value: generationNames[getGeneration(r.birth.year)] },
        { label: tf("zodiacLabel"), formula: f.greg(r.birth), value: zodiacNames[getZodiacSign(r.birth.month, r.birth.day)] },
        { label: tf("chineseZodiacLabel"), formula: String(r.birth.year), value: chineseNames[getChineseZodiac(r.birth.year)] },
      ],
    },
  ];

  const tiles = [
    { k: t("cal.gregorian"), v: t("ymdShort", { y: f.int(g.years), m: f.int(g.months), d: f.int(g.days) }), c: "text-blue-700 dark:text-blue-300" },
    { k: t("cal.hijri"), v: h ? t("ymdShort", { y: f.int(h.years), m: f.int(h.months), d: f.int(h.days) }) : "—", c: "text-emerald-700 dark:text-emerald-300" },
    { k: t("result.nextBirthday"), v: g.daysUntilNext === 0 ? t("result.today") : t("result.daysShort", { n: f.int(g.daysUntilNext) }), c: "text-amber-700 dark:text-amber-300" },
  ];

  const inputRows = [
    { label: t("result.birth"), value: `${f.greg(r.birth)} · ${f.hijri(r.birth)}` },
    { label: t("result.reference"), value: f.greg(r.reference) },
  ];
  const resultRows = [
    { label: t("cal.gregorian"), value: ymd(g) },
    ...(h ? [{ label: t("cal.hijri"), value: ymd(h) }] : []),
    { label: t("result.days"), value: f.int(r.totalDays) },
    { label: t("result.nextGregorian", { n: f.int(g.turning) }), value: `${f.greg(g.nextBirthdayGregorian)} (${countdown(g.daysUntilNext)})` },
  ];

  return (
    <SectionCard phoneRole="output"
      title={t("result.title")}
      action={<AgeShareExportModal inputRows={inputRows} resultRows={resultRows} heroLabel={t("result.title")} heroValue={ageText} sentence={`${ageText} · ${hijriText}`} />}
      className="lg:flex lg:flex-1 lg:flex-col"
      bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col"
    >
      <div className="mb-3 grid grid-cols-3 gap-2 text-center" data-bp-inner>
        {tiles.map((s) => (
          <div key={s.k} className="rounded-lg bg-blue-50 px-1 py-1.5 dark:bg-blue-500/10">
            <p className="text-[10px] leading-3 font-semibold text-zinc-500 dark:text-zinc-400">{s.k}</p>
            <p dir="auto" className={`mt-0.5 text-sm font-bold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>
      <LiveTableFill>
        <LiveTable3DLayout
          headings={[t("result.colItem"), t("result.colCalc"), t("result.colValue")]}
          groups={groups}
          drawing={
            <AgeDualDial
              outer={{ age: g, color: AGE_COLORS.gregorian, label: t("cal.gShort"), next: `${t("cal.gregorian")} · ${countdown(g.daysUntilNext)}` }}
              inner={h ? { age: h, color: AGE_COLORS.hijri, label: t("cal.hShort"), next: `${t("cal.hijri")} · ${countdown(h.daysUntilNext)}` } : null}
              centerTop={f.int(g.years)}
              centerBottom={h ? t("result.dialCenter", { h: f.int(h.years) }) : ""}
            />
          }
          caption={t("result.dialCaption", { g: f.pct(g.yearProgress), h: h ? f.pct(h.yearProgress) : "—" })}
        />
      </LiveTableFill>
    </SectionCard>
  );
}
