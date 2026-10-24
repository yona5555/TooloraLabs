"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, solveQuadraticRoots, solveLinearRoot, fmt } from "./mathSolverEducationMath";
import GapFreeRow from "@/components/tool-ui/GapFreeRow";
import { STATION_LI, STATION_LINE_HIDE, STATION_MARK_ROW, STATION_NAME, STATION_OL, STATION_VALUE } from "@/components/tool-ui/StationTimeline";

/** Decision-flow diagram: the real 4-station pipeline the hero and every other indicator share —
 * clicking a station is the ONE control that drives dims.selectedStep, so this is the indicator
 * that makes "jump to step N" actually mean something across the whole page, not just itself. */
export default function SolveFlowDiagram() {
  const t = useTranslations("tools.step-by-step-math-solver.education.solveFlow");
  const { dims, setDim } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);
  const step = dims.selectedStep ?? 3;

  let keyQuantityLabel = "";
  let keyQuantityValue = "";
  let resultValue = "";
  if (dims.mode === "quadratic-equation" || (dims.mode === "derivative" && eq.degree === 2)) {
    const r = solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
    keyQuantityLabel = t("discriminantLabel");
    keyQuantityValue = fmt(r.discriminant);
    resultValue = r.kind === "two-real" ? `x₁=${fmt(r.x1)}, x₂=${fmt(r.x2)}` : r.kind === "one-real" ? `x=${fmt(r.x)}` : `${fmt(r.re)} ± ${fmt(Math.abs(r.im))}i`;
  } else {
    const root = solveLinearRoot(eq.coeffs[0], eq.coeffs[1]);
    keyQuantityLabel = t("slopeLabel");
    keyQuantityValue = fmt(eq.coeffs[1]);
    resultValue = root !== null ? `x = ${fmt(root)}` : t("noUniqueRoot");
  }

  const stations = [
    { key: "entered", value: eq.label },
    { key: "coefficients", value: eq.coeffs.map((c) => fmt(c)).join(", ") },
    { key: "keyQuantity", value: `${keyQuantityLabel} = ${keyQuantityValue}` },
    { key: "result", value: resultValue },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <GapFreeRow className="mt-4">
        <div dir="ltr" className="w-full overflow-x-auto lg:flex-1">
          <ol className={`${STATION_OL} min-w-[460px]`}>
            {stations.map((s, i) => {
              const active = i === step;
              return (
                <li key={s.key} className={STATION_LI}>
                  <div className={STATION_MARK_ROW}>
                    <div className={`h-px flex-1 ${STATION_LINE_HIDE} ${i === 0 ? "opacity-0" : active || i <= step ? "bg-blue-400 dark:bg-blue-500/60" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                    <button
                      type="button"
                      onClick={() => setDim("selectedStep", i)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                        active ? "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-500/30" : i < step ? "bg-blue-200 text-blue-800 dark:bg-blue-500/40 dark:text-blue-100" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {i + 1}
                    </button>
                    <div className={`h-px flex-1 ${STATION_LINE_HIDE} ${i === stations.length - 1 ? "opacity-0" : i < step ? "bg-blue-400 dark:bg-blue-500/60" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                  </div>
                  <p className={`${STATION_NAME} text-xs font-semibold ${active ? "text-blue-700 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}`}>{t(`stations.${s.key}`)}</p>
                  <p dir="ltr" className={`${STATION_VALUE} max-w-[110px] truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400 max-md:max-w-full`} title={s.value}>
                    {s.value}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t(`stations.${stations[step].key}`), value: stations[step].value, emphasize: true }]} />
      </GapFreeRow>
    </SectionCard>
  );
}
