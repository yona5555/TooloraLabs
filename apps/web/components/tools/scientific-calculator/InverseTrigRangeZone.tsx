"use client";
import { useTranslations } from "next-intl";
import { ScientificCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificAngle } from "./ScientificAngleContext";

const tool = new ScientificCalculator();
const ZONES = [
  { key: "qi", from: 0, to: 90, className: "bg-emerald-400/70 dark:bg-emerald-500/60" },
  { key: "qii", from: 90, to: 180, className: "bg-amber-300/70 dark:bg-amber-500/50" },
  { key: "qiii", from: 180, to: 270, className: "bg-rose-400/70 dark:bg-rose-500/60" },
  { key: "qiv", from: 270, to: 360, className: "bg-emerald-400/70 dark:bg-emerald-500/60" },
];

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #19 (Zone Strip): arcsin only ever returns an angle between −90° and 90° — this strip shows which quadrant the hero's current angle falls in, and whether asin(sin(angle)) actually comes back out to the same angle or a different, principal-range equivalent. */
export default function InverseTrigRangeZone() {
  const t = useTranslations("tools.scientific-calculator.education.inverseTrigRange");
  const { dims } = useScientificAngle();

  const sinOut = tool.execute({ operation: "sin", a: dims.angleDeg, angleMode: "deg" }, { locale: "en-US" });
  if (!sinOut.success) return null;
  const sinVal = sinOut.data.result;
  const asinOut = tool.execute({ operation: "asin", a: sinVal, angleMode: "deg" }, { locale: "en-US" });
  if (!asinOut.success) return null;
  const principal = round3(asinOut.data.result);
  const isPrincipal = Math.abs(principal - dims.angleDeg) < 0.05;
  const pct = (dims.angleDeg / 360) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-6 w-full">
        <div className="relative h-3 w-full overflow-hidden rounded-full">
          {ZONES.map((z) => (
            <div key={z.key} className={`absolute inset-y-0 ${z.className}`} style={{ left: `${(z.from / 360) * 100}%`, width: `${((z.to - z.from) / 360) * 100}%` }} />
          ))}
          <div className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-zinc-900 dark:bg-white" style={{ left: `calc(${pct}% - 3px)` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <span>0°</span>
          <span>90°</span>
          <span>180°</span>
          <span>270°</span>
          <span>360°</span>
        </div>
      </div>
      <div className="mt-6">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.angle"), value: `${round3(dims.angleDeg)}°` },
            { label: t("worked.sinValue"), value: `${round3(sinVal)}` },
            { label: t("worked.asinResult"), value: `${principal}°`, emphasize: true },
            { label: t("worked.match"), value: isPrincipal ? t("worked.matchYes") : t("worked.matchNo"), note: isPrincipal ? undefined : t("worked.matchNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
