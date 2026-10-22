"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { ltr } from "@/components/tool-ui/MixedText";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import DueDateShareExportModal from "./DueDateShareExportModal";
import { useDateFmt } from "./DueDateLiveContext";
import { MILESTONES, TERM_DAYS, naegeleMnemonic, wd, type DueSnap } from "./dueDate";
import type { DueDateError } from "./types";
import { useSnapTableRows } from "../ideal-weight-calculator/useSnapTableRows";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const DueDatePathScene3D = dynamic(() => import("./DueDatePathScene3D"), { ssr: false });

type Props = {
  /** The last valid result. */
  snap: DueSnap;
  /** The calculator's error for the current (invalid) input; the last good result stays on screen. */
  error: DueDateError | null;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

/** Result card: due date up top, then the deep live table on the left and the 3D week path on the right. */
export default function DueDateResult({ snap, error, fill = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useSnapTableRows(wrapRef);
  const t = useTranslations("tools.due-date-calculator.result");
  const tForm = useTranslations("tools.due-date-calculator.form");
  const tModes = useTranslations("tools.due-date-calculator.modes");
  const tv = useTranslations("tools.due-date-calculator.visuals.result");
  const tc = useTranslations("tools.due-date-calculator.visuals.common");
  const f = useDateFmt();

  const { method, anchor, cycle, today, conception, due, lmp, ga, trimester, daysLeft, percent } = snap;
  const A = tc("abbr.lmp");
  const C = tc("abbr.conception");
  const TD = tc("abbr.today");
  const d = tc("abbr.d");
  const wdUnit = tc("wdUnit");
  const trimesterText = t(`trimesterValue.${trimester}`);

  const conceptionFormula =
    method === "lmp" ? `${A} + (${cycle} − 14) ${d}` : method === "conception" ? tv("given") : `${tc("abbr.transfer")} − ${method === "ivf3day" ? 3 : 5} ${d}`;

  const dateRows = [
    { label: tForm(`dateLabels.${method}`), formula: tv("given"), value: f.long(anchor) },
    { label: t("conceptionDate"), formula: conceptionFormula, value: f.long(conception), emphasize: method !== "conception" },
    { label: tv("lmpEquivalent"), formula: `${C} − 14 ${d}`, value: f.long(lmp) },
    { label: t("dueDate"), formula: `${C} + 266 ${d}`, value: f.long(due), emphasize: true },
  ];
  if (method === "lmp") {
    dateRows.push(
      { label: tv("naegeleClassic"), formula: `${A} + 280 ${d}`, value: f.long(anchor + TERM_DAYS) },
      { label: tv("naegeleMnemonic"), formula: tv("mnemonicFormula"), value: f.long(naegeleMnemonic(anchor)) },
      { label: tv("cycleShift"), formula: `${cycle} − 28`, value: `${cycle - 28 > 0 ? "+" : ""}${cycle - 28}`, emphasize: false },
    );
  }

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: tModes("groupLabel"), formula: tv("given"), value: tModes(`labels.${method}`) },
        ...(method === "lmp" ? [{ label: tForm("cycleLengthDays"), formula: tv("given"), value: String(cycle), unit: d }] : []),
        { label: tv("today"), formula: tv("given"), value: f.long(today) },
      ],
    },
    { title: tv("groupDates"), rows: dateRows },
    {
      title: tv("groupProgress"),
      rows: [
        { label: t("gestationalAge"), formula: `${TD} − ${A} = ${ga} ${d}`, value: wd(ga), unit: wdUnit, emphasize: true },
        { label: t("trimester"), formula: ga < 98 ? "< 14+0" : ga < 196 ? "14+0 – 27+6" : "≥ 28+0", value: trimesterText },
        { label: tv("percent"), formula: `${ga} ÷ 280`, value: percent.toFixed(1), unit: "%" },
        { label: t("daysUntilDue"), formula: `${tc("abbr.due")} − ${TD}`, value: String(daysLeft), unit: d, emphasize: true },
        { label: tv("weeksLeft"), formula: `${daysLeft} ÷ 7`, value: daysLeft >= 0 ? wd(daysLeft) : `−${wd(-daysLeft)}`, unit: wdUnit },
      ],
    },
    {
      title: tv("groupTerm"),
      rows: (
        [
          ["early", 259],
          ["full", 273],
          ["due", 280],
          ["late", 287],
          ["post", 294],
        ] as const
      ).map(([k, g]) => ({ label: tc(`zoneStart.${k}`), formula: `${A} + ${g} ${d} (${wd(g)})`, value: f.long(lmp + g), emphasize: k === "due" })),
    },
    {
      title: tv("groupTrimesters"),
      rows: [
        { label: tv("t2Starts"), formula: `${A} + 98 ${d} (14+0)`, value: f.long(lmp + 98) },
        { label: tv("t3Starts"), formula: `${A} + 196 ${d} (28+0)`, value: f.long(lmp + 196) },
      ],
    },
    {
      title: tv("groupMilestones"),
      rows: MILESTONES.map((m) => ({
        label: tc(`milestones.${m.key}`),
        formula: `${wd(m.from)} – ${wd(m.to - 1)}`,
        value: `${f.short(lmp + m.from)} – ${f.short(lmp + m.to - 1)}`,
        emphasize: ga >= m.from && ga < m.to,
      })),
    },
  ];

  const dueText = f.long(due);
  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { ga: ltr(wd(ga)), due: ltr(dueText) })}
      drawing={
        <Scene3D className="min-h-0!" camera={[0, 3.5, 3.1]}>
          <DueDatePathScene3D ga={ga} gaLabel={wd(ga)} dueLabel={f.num(due)} todayLabel={f.num(today)} />
        </Scene3D>
      }
    />
  );

  return (
    <SectionCard
      title={t("heading")}
      className={fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}
      bodyClassName={fill ? "p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6" : undefined}
      action={
        <DueDateShareExportModal
          inputRows={[{ label: t("conceptionDate"), value: f.long(conception) }]}
          resultRows={[
            { label: t("gestationalAge"), value: `${Math.floor(ga / 7)}w ${ga % 7}d` },
            { label: t("trimester"), value: trimesterText },
            { label: t("daysUntilDue"), value: `${daysLeft}` },
          ]}
          heroLabel={t("dueDate")}
          heroValue={dueText}
          sentence={t("sentence", { dueDate: dueText, weeks: Math.floor(ga / 7), days: ga % 7 })}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("dueDate")}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dueText}</p>
        </div>
        <div className="flex gap-2 text-center">
          <div className="rounded-lg bg-blue-50 px-2.5 py-1 dark:bg-blue-500/10">
            <p dir="ltr" className="text-sm font-bold tabular-nums text-blue-700 dark:text-blue-300">
              {wd(ga)}
            </p>
            <p className="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">{t("gestationalAge")}</p>
          </div>
          <div className="rounded-lg bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
            <p dir="ltr" className="text-sm font-bold tabular-nums text-zinc-800 dark:text-zinc-100">
              {daysLeft}
            </p>
            <p className="text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">{t("daysUntilDue")}</p>
          </div>
        </div>
      </div>
      <div ref={wrapRef} className={fill ? "lg:flex lg:flex-1 lg:flex-col" : undefined}>
        {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
      </div>
    </SectionCard>
  );
}
