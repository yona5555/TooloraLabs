"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { f1 } from "@/components/tool-ui/indicator-kit/format";
import { useBodyFatLive } from "./BodyFatLiveContext";
import { ACSM, aceClasses, aceOf, waistFor } from "./ace";

/**
 * Input-column reference (§17/§27): the five ACE classes for the chosen sex as a tagged live table,
 * each with the waist range that lands in it for the current height and neck (and hip). The
 * current class is tagged; its rows grow so the column ends flush with the Result card.
 */
export default function BodyFatAceLadder() {
  const t = useTranslations("tools.body-fat-calculator.visuals.ladder");
  const tCat = useTranslations("tools.body-fat-calculator.categories");
  const { m, bf } = useBodyFatLive();
  const g = m.gender;
  const now = aceOf(g, bf);
  const [aLo, aHi] = ACSM[g];
  const wcm = (p: number) => Math.max(0, waistFor(m, p));

  return (
    <SectionCard title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="flex flex-col p-4 lg:flex-1 lg:p-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <span>{t("colClass")}</span>
        <span className="text-end">{t("colFat")}</span>
        <span className="w-24 text-end">{t("colWaist")}</span>
      </div>
      <ul className="mt-1 flex flex-1 flex-col gap-1.5">
        {aceClasses(g).map((c) => {
          const on = c.key === now.key;
          const lo = c.min === 0 ? null : wcm(c.min);
          const hi = Number.isFinite(c.max) ? wcm(c.max) : null;
          const waist = lo === null ? `< ${f1(hi ?? 0)}` : hi === null ? `> ${f1(lo)}` : `${f1(lo)}–${f1(hi)}`;
          return (
            <li
              key={c.key}
              className={`grid flex-1 grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-lg border px-3 py-2 text-sm ${
                on ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{tCat(c.key)}</span>
                {on && <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">{t("you", { bf: f1(bf) })}</span>}
              </span>
              <span dir="ltr" className="text-end tabular-nums text-zinc-700 dark:text-zinc-300">
                {c.min === 0 ? `≤ ${c.max}` : Number.isFinite(c.max) ? `${c.min}–${c.max}` : `> ${c.min}`}%
              </span>
              <span dir="ltr" className="w-24 text-end tabular-nums text-zinc-700 dark:text-zinc-300">
                {waist}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
        {t("acsm", { lo: aLo, hi: aHi, wlo: f1(wcm(aLo)), whi: f1(wcm(aHi)) })}
      </p>
    </SectionCard>
  );
}
