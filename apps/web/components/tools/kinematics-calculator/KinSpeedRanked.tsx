"use client";
import { useTranslations } from "next-intl";
import { KINEMATICS_REFERENCE_SPEEDS } from "@tooloralabs/tools";
import KinIndicatorCard, { KinIndicatorUnavailable } from "./KinIndicatorCard";
import { useKinModel } from "./KinLiveContext";

/**
 * Type #5 (Ranked Horizontal Bar List): the motion's top speed max(|v₀|, |v|) ranked among the
 * calculator's real reference speeds, on a log scale so a walk and the speed of sound fit together.
 */
export default function KinSpeedRanked() {
  const t = useTranslations("tools.kinematics-calculator.education.lab.ranked");
  const tSpeeds = useTranslations("tools.kinematics-calculator.referenceTable.speeds");
  const { k, f } = useKinModel();
  if (!k) return <KinIndicatorUnavailable title={t("title")} />;

  const peak = Math.max(Math.abs(k.v0), Math.abs(k.v));
  const items = [
    ...KINEMATICS_REFERENCE_SPEEDS.map((r) => ({ key: r.key, label: tSpeeds(r.key), speed: r.speed, you: false })),
    { key: "you", label: t("you"), speed: peak, you: true },
  ].sort((a, b) => b.speed - a.speed);
  const lo = Math.log10(0.5);
  const hi = Math.log10(Math.max(400, peak * 1.2));
  const width = (s: number) => `${Math.max(2, ((Math.log10(Math.max(s, 0.5)) - lo) / (hi - lo)) * 100)}%`;
  const rank = items.findIndex((i) => i.you) + 1;
  const slower = KINEMATICS_REFERENCE_SPEEDS.filter((r) => r.speed < peak).sort((a, b) => b.speed - a.speed)[0];
  const faster = KINEMATICS_REFERENCE_SPEEDS.filter((r) => r.speed >= peak).sort((a, b) => a.speed - b.speed)[0];

  const list = (
    <ul className="w-full max-w-[400px] space-y-2">
      {items.map((i) => (
        <li key={i.key}>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className={i.you ? "font-bold text-blue-700 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}>{i.label}</span>
            <span dir="ltr" className="shrink-0 font-mono font-semibold text-zinc-800 dark:text-zinc-100">{`${f(i.speed, 1)} m/s`}</span>
          </div>
          <div className="mt-1 h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className={`h-full rounded-full ${i.you ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-400 dark:bg-zinc-500"}`} style={{ width: width(i.speed) }} />
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <KinIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={list}
      rows={[
        { label: t("peak"), value: `max(|${f(k.v0)}|, |${f(k.v)}|) = ${f(peak)} m/s` },
        { label: t("kmh"), value: `${f(peak)} × 3.6 = ${f(peak * 3.6, 1)} km/h` },
        ...(slower ? [{ label: t("vsSlower", { name: tSpeeds(slower.key) }), value: `× ${f(peak / slower.speed)}` }] : []),
        ...(faster && peak > 0 ? [{ label: t("vsFaster", { name: tSpeeds(faster.key) }), value: `÷ ${f(faster.speed / peak)}` }] : []),
        { label: t("rank"), value: `${rank} / ${items.length}`, emphasize: true },
      ]}
    />
  );
}
