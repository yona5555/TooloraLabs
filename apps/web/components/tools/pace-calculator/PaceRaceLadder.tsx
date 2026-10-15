"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { paceOf, usePaceLive } from "./PaceLiveContext";
import { RACES, clock, riegel } from "./pace";

/**
 * Input-column filler (§27): the standard races at the live effort, each with its even-pace time
 * and its Riegel prediction (T2 = T1 × (D2 / D1)^1.06) as two bars on one time scale. Grows with
 * the column (lg:flex-1).
 */
export default function PaceRaceLadder() {
  const t = useTranslations("tools.pace-calculator.visuals.ladder");
  const tRace = useTranslations("tools.pace-calculator.visuals.common.races");
  const snap = usePaceLive();
  const pk = paceOf(snap);
  const rows = RACES.map((r) => ({ ...r, even: r.km * pk, pred: riegel(snap.km, snap.sec, r.km) }));
  const max = Math.max(...rows.map((r) => Math.max(r.even, r.pred)));

  return (
    <SectionCard title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { pace: `${clock(pk)} /km` })}</p>
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-300">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
          {t("even")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />
          {t("riegel")}
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-2 lg:flex-1 lg:justify-around">
        {rows.map((r) => (
          <li key={r.key}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{tRace(r.key)}</span>
              <span dir="ltr" className="font-mono text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
                <b className="text-blue-600 dark:text-blue-400">{clock(r.even)}</b> · <b className="text-amber-600 dark:text-amber-400">{clock(r.pred)}</b>
              </span>
            </div>
            <div dir="ltr" className="mt-0.5 space-y-0.5">
              <div className="h-1 rounded-full bg-blue-500" style={{ width: `${Math.max(2, (r.even / max) * 100)}%` }} />
              <div className="h-1 rounded-full bg-amber-500" style={{ width: `${Math.max(2, (r.pred / max) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
