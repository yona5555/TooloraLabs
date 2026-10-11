"use client";
import { useTranslations } from "next-intl";
import KinIndicatorCard, { KinIndicatorUnavailable } from "./KinIndicatorCard";
import { useKinModel } from "./KinLiveContext";

/**
 * Type #12 (Sensitivity Trio): the same v₀ and a run for half, the same and double the time.
 * The velocity changes linearly with time, the displacement does not: the bars show both, scaled
 * to the double-time run.
 */
export default function KinTimeTrio() {
  const t = useTranslations("tools.kinematics-calculator.education.lab.trio");
  const { k, f } = useKinModel();
  if (!k || k.span <= 0) return <KinIndicatorUnavailable title={t("title")} />;

  const trio = k.timeSensitivity;
  const vMax = Math.max(...trio.map((s) => Math.abs(s.v)), 1e-12);
  const xMax = Math.max(...trio.map((s) => Math.abs(s.x)), 1e-12);
  const names = [t("half"), t("current"), t("double")];

  const indicator = (
    <div className="grid w-full max-w-[400px] grid-cols-3 gap-2">
      {trio.map((s, i) => {
        const cur = i === 1;
        return (
          <div
            key={s.factor}
            className={`flex flex-col rounded-xl border px-2 py-3 text-center ${cur ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/15" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40"}`}
          >
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{names[i]}</span>
            <span dir="ltr" className="font-mono text-sm font-bold text-zinc-800 dark:text-zinc-100">{`t = ${f(s.t, 2)} s`}</span>
            <div className="mt-3 flex h-28 items-end justify-center gap-3">
              <div className="flex h-full flex-col items-center justify-end">
                <div className="w-5 rounded-t bg-violet-500 dark:bg-violet-400" style={{ height: `${Math.max(2, (Math.abs(s.v) / vMax) * 100)}%` }} />
                <span className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">v</span>
              </div>
              <div className="flex h-full flex-col items-center justify-end">
                <div className={`w-5 rounded-t ${s.x < 0 ? "bg-amber-500 dark:bg-amber-400" : "bg-blue-600 dark:bg-blue-400"}`} style={{ height: `${Math.max(2, (Math.abs(s.x) / xMax) * 100)}%` }} />
                <span className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">x</span>
              </div>
            </div>
            <span dir="ltr" className="mt-2 font-mono text-xs font-semibold text-violet-700 dark:text-violet-300">{`${f(s.v, 1)} m/s`}</span>
            <span dir="ltr" className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-300">{`${f(s.x, 1)} m`}</span>
          </div>
        );
      })}
    </div>
  );

  const [h, c, d] = trio;
  return (
    <KinIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("halfRow"), value: `v = ${f(k.v0)} + ${f(k.a)} × ${f(h.t, 2)} = ${f(h.v)} m/s · x = ${f(h.x)} m` },
        { label: t("currentRow"), value: `v = ${f(c.v)} m/s · x = ${f(c.x)} m` },
        { label: t("doubleRow"), value: `v = ${f(k.v0)} + ${f(k.a)} × ${f(d.t, 2)} = ${f(d.v)} m/s · x = ${f(d.x)} m` },
        { label: t("ratio"), value: `x(2t) / x(t) = ${Math.abs(c.x) > 1e-12 ? f(d.x / c.x, 3) : "—"}`, emphasize: true, note: t("ratioNote") },
      ]}
    />
  );
}
