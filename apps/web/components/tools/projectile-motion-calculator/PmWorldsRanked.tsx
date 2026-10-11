"use client";
import { useTranslations } from "next-intl";
import { rangeAcrossWorlds } from "@tooloralabs/tools";
import PmIndicatorCard from "./PmIndicatorCard";
import { usePmModel } from "./PmLiveContext";

/**
 * Type #5 (Ranked Horizontal Bar List): the same live launch (v₀, θ, h₀) on eight real worlds,
 * longest range first; the world matching the current g is highlighted (a custom g joins the list).
 * Bar length is the range on that world; the gravity is written beside its name.
 */
export default function PmWorldsRanked() {
  const t = useTranslations("tools.projectile-motion-calculator.education.lab.worlds");
  const { a, f } = usePmModel();
  if (!a) return null;

  const list = rangeAcrossWorlds(a);
  const top = Math.max(...list.map((w) => w.range), 1e-9);
  const earth = list.find((w) => w.key === "earth");
  const moon = list.find((w) => w.key === "moon");
  const jupiter = list.find((w) => w.key === "jupiter");

  const indicator = (
    <ol className="w-[380px] max-w-full space-y-1.5">
      {list.map((w, i) => (
        <li key={w.key} className={`rounded-lg px-2 py-1 ${w.current ? "bg-blue-50 ring-1 ring-blue-400 dark:bg-blue-500/10 dark:ring-blue-500/60" : ""}`}>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {`${i + 1}. ${t(`names.${w.key}`)}`}
              <span dir="ltr" className="ms-1.5 font-mono font-normal text-zinc-500 dark:text-zinc-400">{`g ${f(w.gravity)}`}</span>
            </span>
            <span dir="ltr" className={`font-mono font-semibold ${w.current ? "text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}>{`${f(w.range, 1)} m`}</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className={`h-full rounded-full ${w.current ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-400 dark:bg-zinc-500"}`} style={{ width: `${Math.max(1, (w.range / top) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );

  const cur = list.find((w) => w.current);
  return (
    <PmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("rule"), value: "R ∝ 1 / g" },
        ...(cur ? [{ label: t("yours"), value: `${f(cur.range)} m · ${f(cur.timeOfFlight)} s` }] : []),
        ...(earth ? [{ label: t("names.earth"), value: `${f(earth.range)} m · h ${f(earth.maxHeight)} m` }] : []),
        ...(moon && earth && earth.range > 0 ? [{ label: t("names.moon"), value: `${f(moon.range)} m (×${f(moon.range / earth.range, 2)})` }] : []),
        ...(jupiter && earth && earth.range > 0 ? [{ label: t("names.jupiter"), value: `${f(jupiter.range)} m (×${f(jupiter.range / earth.range, 2)})`, emphasize: true, note: t("source") }] : []),
      ]}
    />
  );
}
