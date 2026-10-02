"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, characteristicLength, surfaceAreaAtLength, computeSurfaceAreaFor, ALL_SHAPES, round } from "./surfaceAreaEducationMath";

/** Type #17 (Tagged Reference Table): every solid in the family, each evaluated at the SAME live characteristic length as the currently active solid — the active row is tagged, so the table re-sorts and re-tags itself with every drag or field edit. */
export default function ShapeFamilyTable() {
  const t = useTranslations("tools.surface-area-calculator.education.shapeFamily");
  const tShape = useTranslations("tools.surface-area-calculator.form");
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const length = characteristicLength(n);
  const liveTotal = computeSurfaceAreaFor(n);

  const rows = ALL_SHAPES.map((shape) => ({
    shape,
    area: shape === dims.shape ? liveTotal : surfaceAreaAtLength(shape, length),
  })).sort((a, b) => b.area - a.area);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { length: round(length) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <table className="w-full min-w-[260px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-start dark:border-zinc-700">
                <th className="px-3 py-2 text-start font-semibold">{t("columnShape")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("columnArea")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const active = r.shape === dims.shape;
                return (
                  <tr key={r.shape} className={`border-b border-zinc-100 dark:border-zinc-800 ${active ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}>
                    <td className={`px-3 py-2 ${active ? "font-bold text-blue-700 dark:text-blue-300" : ""}`}>
                      {tShape(`shape.${r.shape}`)}
                      {active && <span className="ms-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">{t("activeTag")}</span>}
                    </td>
                    <td className="px-3 py-2 font-mono">{round(r.area)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.length"), value: `${round(length)}` },
            { label: t("worked.winner"), value: tShape(`shape.${rows[0].shape}`), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
