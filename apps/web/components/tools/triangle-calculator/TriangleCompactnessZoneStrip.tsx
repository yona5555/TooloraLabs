"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import { EXAMPLE, compactnessIndex, compactnessMin, compactnessMax, round } from "./triangleEducationMath";

type ZoneKey = "compact" | "balanced" | "elongated";
const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "compact", from: compactnessMin, to: 28, colorClass: "fill-green-500 dark:fill-green-400" },
  { key: "balanced", from: 28, to: 40, colorClass: "fill-blue-500 dark:fill-blue-400" },
  { key: "elongated", from: 40, to: compactnessMax, colorClass: "fill-amber-500 dark:fill-amber-400" },
];
const CAPTION_COLOR: Record<ZoneKey, string> = {
  compact: "fill-green-600 dark:fill-green-400",
  balanced: "fill-blue-600 dark:fill-blue-400",
  elongated: "fill-amber-600 dark:fill-amber-400",
};

const W = 280;
const H = 70;
const BAR_Y = 24;
const BAR_H = 16;

function zoneFor(value: number): ZoneKey {
  return (ZONES.find((z) => value < z.to) ?? ZONES[ZONES.length - 1]).key;
}

/** Zone Strip (#19) — the example triangle's isoperimetric compactness index (P^2/A, lower = closer to equilateral) placed on a labeled compact/balanced/elongated strip. */
export default function TriangleCompactnessZoneStrip() {
  const t = useTranslations("tools.triangle-calculator.education.lab.compactness");
  const tw = useTranslations("tools.triangle-calculator.education.lab.compactness.worked");
  const tZones = useTranslations("tools.triangle-calculator.education.lab.compactness.zones");

  const domain = compactnessMax - compactnessMin;
  const clamped = Math.min(Math.max(compactnessIndex, compactnessMin), compactnessMax);
  const markerX = ((clamped - compactnessMin) / domain) * W;
  const zone = zoneFor(compactnessIndex);
  // Anchor the label toward the inside of the viewBox near either edge — a centered label at
  // the very start/end of the strip would otherwise run past the SVG's own boundary (the same
  // fix RatioGauge applies to its extreme ticks).
  const labelAnchor: "start" | "middle" | "end" = markerX < 24 ? "start" : markerX > W - 24 ? "end" : "middle";
  const labelX = labelAnchor === "start" ? Math.max(markerX - 10, 0) : labelAnchor === "end" ? Math.min(markerX + 10, W) : markerX;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0">
          <svg viewBox={`-10 0 ${W + 20} ${H}`} role="img" aria-label={`${t("title")}: ${round(compactnessIndex)} — ${tZones(zone)}`} className="mx-auto block w-full max-w-[280px]">
            {ZONES.map((z) => {
              const x = ((z.from - compactnessMin) / domain) * W;
              const w = ((z.to - z.from) / domain) * W;
              return <rect key={z.key} x={x} y={BAR_Y} width={w} height={BAR_H} className={z.colorClass} opacity={0.75} />;
            })}
            {ZONES.map((z, i) => {
              if (i === 0) return null;
              const x = ((z.from - compactnessMin) / domain) * W;
              return <line key={z.key} x1={x} y1={BAR_Y - 4} x2={x} y2={BAR_Y + BAR_H + 4} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />;
            })}
            <line x1={markerX} y1={BAR_Y - 10} x2={markerX} y2={BAR_Y + BAR_H + 10} stroke="currentColor" strokeWidth={2.5} />
            <circle cx={markerX} cy={BAR_Y - 10} r={4} fill="currentColor" />
            <text x={labelX} y={BAR_Y - 16} textAnchor={labelAnchor} fontSize={12} fontWeight={700} fill="currentColor">
              {round(compactnessIndex)}
            </text>
            <text x={labelX} y={BAR_Y + BAR_H + 24} textAnchor={labelAnchor} fontSize={11} fontWeight={600} className={CAPTION_COLOR[zone]}>
              {tZones(zone)}
            </text>
          </svg>
        </div>
        <TriangleWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: tw("perimeter"), value: `${EXAMPLE.perimeter}` },
            { label: tw("area"), value: `${round(EXAMPLE.area)}` },
            { label: tw("index"), value: round(compactnessIndex).toString(), emphasize: true, note: tw("indexNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
