"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const MAX_ROWS = 8;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #17 (Tagged Reference Table): every multiple of the live unit fraction 1/denominatorA, up to the whole — highlighting which one matches the live numeratorA. */
export default function FractionUnitFractionsTable() {
  const t = useTranslations("tools.fraction-calculator.education.unitFractions");
  const { dims } = useFractionLive();
  const denom = Math.abs(Math.round(dims.denominatorA));
  if (denom === 0 || denom > MAX_ROWS * 4) return null;
  const rowCount = Math.min(denom, MAX_ROWS);

  return (
    <SectionCard title={t("title", { denom })}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { denom })}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-start dark:border-zinc-700">
              <th className="px-3 py-2 text-start font-semibold">{t("columnFraction")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("columnDecimal")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("columnMatch")}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, i) => {
              const n = i + 1;
              const isMatch = n === Math.round(dims.numeratorA) && denom === Math.round(dims.denominatorA);
              return (
                <tr key={n} className={`border-b border-zinc-100 dark:border-zinc-800 ${isMatch ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}>
                  <td className={`px-3 py-2 font-mono ${isMatch ? "font-bold text-blue-700 dark:text-blue-300" : ""}`}>{`${n}/${denom}`}</td>
                  <td className="px-3 py-2 font-mono">{round3(n / denom)}</td>
                  <td className="px-3 py-2 font-semibold text-blue-700 dark:text-blue-300">{isMatch ? t("matchMarker") : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.unitFraction"), value: `1/${denom}` },
            { label: t("worked.currentA"), value: `${dims.numeratorA}/${denom}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
