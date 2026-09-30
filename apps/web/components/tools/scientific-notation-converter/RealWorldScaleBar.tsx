"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const SCALE: { key: string; exponent: number }[] = [
  { key: "hydrogenAtom", exponent: -10 },
  { key: "virus", exponent: -7 },
  { key: "humanHair", exponent: -4 },
  { key: "humanHeight", exponent: 0 },
  { key: "mountEverest", exponent: 4 },
  { key: "earthDiameter", exponent: 7 },
  { key: "distanceToSun", exponent: 11 },
  { key: "lightYear", exponent: 16 },
];

const MIN_EXP = -10;
const MAX_EXP = 16;

/** Type #10 (Log-Scale Magnitude Bar): real physical sizes spanning 26 orders of magnitude, from a hydrogen atom to a light-year — no linear scale could show all of these on one readable line. */
export default function RealWorldScaleBar() {
  const t = useTranslations("tools.scientific-notation-converter.education.realWorldScale");

  const marks = SCALE.map((s) => ({ ...s, pct: ((s.exponent - MIN_EXP) / (MAX_EXP - MIN_EXP)) * 100 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-6 w-full">
        <div className="relative h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
          {marks.map((m) => (
            <div key={m.key} className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 dark:border-zinc-900 dark:bg-blue-400" style={{ left: `${m.pct}%` }} />
          ))}
        </div>
        <div className="relative mt-2 h-16 w-full text-[11px]">
          {marks.map((m, i) => (
            <div key={m.key} className="absolute -translate-x-1/2 text-center" style={{ left: `${m.pct}%`, top: `${(i % 2) * 28}px` }}>
              <div className="font-semibold text-zinc-700 dark:text-zinc-200">{t(`items.${m.key}`)}</div>
              <div className="text-zinc-400 dark:text-zinc-500">{`10^${m.exponent}`}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("items.hydrogenAtom"), value: "10^-10 m" },
            { label: t("items.humanHeight"), value: "10^0 m" },
            { label: t("items.lightYear"), value: "10^16 m", emphasize: true, note: t("worked.spanNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
