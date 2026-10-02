"use client";
import { useTranslations } from "next-intl";
import { FractionCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const tool = new FractionCalculator();
const MAX_GRID_CELLS = 144;

/** Type #18 (Formula Diagram): multiplying the live A and B fractions as a real area model — a denominatorA × denominatorB grid with numeratorA × numeratorB cells shaded, live as either fraction changes. */
export default function FractionMultiplicationAreaDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.multiplicationArea");
  const { dims } = useFractionLive();
  const output = tool.execute({ operation: "multiply", numeratorA: dims.numeratorA, denominatorA: dims.denominatorA, numeratorB: dims.numeratorB, denominatorB: dims.denominatorB }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { result } = output.data;

  const dA = Math.abs(Math.round(dims.denominatorA));
  const dB = Math.abs(Math.round(dims.denominatorB));
  const nA = Math.abs(Math.round(dims.numeratorA));
  const nB = Math.abs(Math.round(dims.numeratorB));
  const canRenderGrid = dA > 0 && dB > 0 && dA * dB <= MAX_GRID_CELLS;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        {canRenderGrid ? (
          <div dir="ltr" className="mx-auto shrink-0 grid w-fit gap-px rounded bg-zinc-200 p-px dark:bg-zinc-700" style={{ gridTemplateColumns: `repeat(${dB}, 18px)` }}>
            {Array.from({ length: dA * dB }).map((_, i) => {
              const row = Math.floor(i / dB);
              const col = i % dB;
              const shaded = row < nA && col < nB;
              return <div key={i} className={`h-[18px] w-[18px] ${shaded ? "bg-blue-600/70 dark:bg-blue-400/70" : "bg-white dark:bg-zinc-900"}`} />;
            })}
          </div>
        ) : (
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">{t("gridTooLarge")}</p>
        )}
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: `${dims.numeratorA}/${dims.denominatorA} × ${dims.numeratorB}/${dims.denominatorB}` },
            { label: t("worked.numerators"), value: `${dims.numeratorA} × ${dims.numeratorB} = ${dims.numeratorA * dims.numeratorB}` },
            { label: t("worked.denominators"), value: `${dims.denominatorA} × ${dims.denominatorB} = ${dims.denominatorA * dims.denominatorB}` },
            { label: t("worked.result"), value: `${result.numerator}/${result.denominator}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
