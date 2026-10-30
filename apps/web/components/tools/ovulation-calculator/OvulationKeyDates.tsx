"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useDateFmt, useOvLive } from "./OvulationLiveContext";
import { PHASE_COLORS } from "./ovulation";

/**
 * Input-column filler (§27): the key dates of the projected cycle that holds today (cycle 1 when
 * the entered date is in the future) as a vertical timeline, each with its cycle day, calendar
 * date and a live "done / today / in N days" status. Grows with the column (lg:flex-1).
 */
export default function OvulationKeyDates() {
  const t = useTranslations("tools.ovulation-calculator.visuals.keyDates");
  const { snap } = useOvLive();
  const f = useDateFmt();
  const c = snap.cycles.find((x) => x.next > snap.today) ?? snap.cycles[snap.cycles.length - 1];
  const after = snap.cycles[c.n] ?? null;

  const stations: { key: string; day: number; color: string; strong?: boolean }[] = [
    { key: "period", day: c.start, color: PHASE_COLORS.menses },
    { key: "fwStart", day: c.fwStart, color: PHASE_COLORS.fertile },
    { key: "peak", day: c.ov - 2, color: PHASE_COLORS.fertile },
    { key: "ovulation", day: c.ov, color: PHASE_COLORS.ovulation, strong: true },
    { key: "fwEnd", day: c.fwEnd, color: PHASE_COLORS.luteal },
    { key: "next", day: c.next, color: PHASE_COLORS.menses },
    ...(after ? [{ key: "nextOvulation", day: after.ov, color: PHASE_COLORS.ovulation }] : []),
  ];

  return (
    <SectionCard title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="flex flex-col p-4 lg:flex-1 lg:p-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro", { n: c.n })}</p>
      <ol className="relative mt-3 flex flex-1 flex-col">
        <span aria-hidden className="absolute bottom-3 top-3 w-0.5 bg-zinc-200 start-[7px] dark:bg-zinc-700" />
        {stations.map((s) => {
          const diff = s.day - snap.today;
          const done = diff < 0;
          const status = diff === 0 ? t("today") : done ? t("done") : t("inDays", { n: diff });
          return (
            <li key={s.key} className="relative flex flex-1 items-center gap-3 py-1.5 ps-6">
              <span
                aria-hidden
                className="absolute start-0 h-4 w-4 rounded-full border-2"
                style={{ borderColor: s.color, background: done || diff === 0 ? s.color : "transparent" }}
              />
              <span className="min-w-0 flex-1">
                <span className={`block text-sm ${s.strong ? "font-bold text-amber-700 dark:text-amber-300" : "font-medium text-zinc-900 dark:text-zinc-100"}`}>{t(`rows.${s.key}`)}</span>
                <span className="block text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {t("cycleDay", { n: s.day - c.start + 1 })} · <bdi dir="ltr">{f.long(s.day)}</bdi>
                </span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${done ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"}`}>
                {status}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-800 dark:bg-sky-500/10 dark:text-sky-200">{t("note")}</p>
    </SectionCard>
  );
}
