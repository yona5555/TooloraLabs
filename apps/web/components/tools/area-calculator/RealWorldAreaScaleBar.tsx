"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const SCALE: { key: string; areaM2: number }[] = [
  { key: "postageStamp", areaM2: 0.0006 },
  { key: "a4Paper", areaM2: 0.06 },
  { key: "parkingSpace", areaM2: 12 },
  { key: "tennisCourt", areaM2: 261 },
  { key: "footballField", areaM2: 7140 },
  { key: "centralPark", areaM2: 3410000 },
];

function log10(n: number): number {
  return Math.log(n) / Math.LN10;
}

/** Type #10 (Log-Scale Magnitude Bar): real-world areas spanning more than 10 orders of magnitude, from a postage stamp to a major city park — only a log scale keeps every one of them readable on the same line. */
export default function RealWorldAreaScaleBar() {
  const t = useTranslations("tools.area-calculator.education.realWorldScale");

  const logs = SCALE.map((s) => log10(s.areaM2));
  const minLog = Math.min(...logs);
  const maxLog = Math.max(...logs);
  const marks = SCALE.map((s, i) => ({ ...s, pct: ((logs[i] - minLog) / (maxLog - minLog)) * 100 }));

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
              <div className="text-zinc-400 dark:text-zinc-500">{`${m.areaM2.toLocaleString("en-US")} m²`}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("items.postageStamp"), value: "0.0006 m²" },
            { label: t("items.centralPark"), value: "3,410,000 m²", emphasize: true, note: t("worked.spanNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
