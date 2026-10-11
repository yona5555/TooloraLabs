"use client";
import { useTranslations } from "next-intl";
import { KMH_100, kinematicsStateAt, type KinematicsState } from "@tooloralabs/tools";
import KinIndicatorCard, { KinIndicatorUnavailable } from "./KinIndicatorCard";
import { useKinModel } from "./KinLiveContext";

type Station = { key: "start" | "half" | "turning" | "kmh100" | "end"; s: KinematicsState };

/**
 * Type #9 (Timeline with Stations): the motion read as a journey — start, halfway in time, the
 * instant the car stops and turns back (if it does), the instant it passes 100 km/h (if it does)
 * and the end — each station with its time, velocity and position.
 */
export default function KinMotionTimeline() {
  const t = useTranslations("tools.kinematics-calculator.education.lab.timeline");
  const { k, f } = useKinModel();
  if (!k || k.span <= 0) return <KinIndicatorUnavailable title={t("title")} />;

  const at = (time: number) => kinematicsStateAt(k.v0, k.a, time);
  const stations: Station[] = [
    { key: "start", s: at(0) },
    { key: "half", s: at(k.span / 2) },
    { key: "end", s: at(k.span) },
  ];
  if (k.turning) stations.push({ key: "turning", s: k.turning });
  let t100: number | null = null;
  if (k.a !== 0 && Math.abs(k.v0) < KMH_100) {
    const target = (k.a > 0 ? 1 : -1) * KMH_100;
    const tt = (target - k.v0) / k.a;
    if (tt > 0 && tt < k.span) t100 = tt;
  }
  if (t100 !== null) stations.push({ key: "kmh100", s: at(t100) });
  stations.sort((a, b) => a.s.t - b.s.t);

  const dot: Record<Station["key"], string> = {
    start: "bg-sky-500 dark:bg-sky-400",
    half: "bg-zinc-400 dark:bg-zinc-500",
    turning: "bg-amber-500 dark:bg-amber-400",
    kmh100: "bg-emerald-500 dark:bg-emerald-400",
    end: "bg-blue-600 dark:bg-blue-400",
  };

  const timeline = (
    <ol className="relative w-full max-w-[400px] space-y-3 border-s-2 border-zinc-200 ps-5 dark:border-zinc-700">
      {stations.map((st) => (
        <li key={st.key} className="relative">
          <span className={`absolute -start-[27px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white dark:ring-zinc-900 ${dot[st.key]}`} />
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{t(st.key)}</span>
            <span dir="ltr" className="shrink-0 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">{`t = ${f(st.s.t, 2)} s`}</span>
          </div>
          <p dir="ltr" className="text-start font-mono text-xs text-zinc-500 dark:text-zinc-400">{`v = ${f(st.s.v, 2)} m/s (${f(st.s.v * 3.6, 1)} km/h) · x = ${f(st.s.x, 2)} m`}</p>
        </li>
      ))}
    </ol>
  );

  return (
    <KinIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={timeline}
      rows={[
        { label: t("half"), value: `t = ${f(k.span)} / 2 = ${f(k.span / 2, 2)} s` },
        { label: t("turning"), value: k.turning ? `−v₀ / a = −${f(k.v0)} / ${f(k.a)} = ${f(k.turning.t, 2)} s` : t("never") },
        { label: t("kmh100"), value: t100 !== null ? `(±27.78 − ${f(k.v0)}) / ${f(k.a)} = ${f(t100, 2)} s` : t("never") },
        { label: t("end"), value: `x = ${f(k.steps[k.steps.length - 1].x)} m`, emphasize: true },
      ]}
    />
  );
}
