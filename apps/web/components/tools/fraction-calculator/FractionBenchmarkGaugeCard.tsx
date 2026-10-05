"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue, benchmarkPosition } from "@tooloralabs/tools";

const BENCHMARKS = [0, 0.25, 0.5, 0.75, 1];
const BENCHMARK_LABELS = ["0", "1/4", "1/2", "3/4", "1"];

/** The live result placed on a 0 / 1/4 / 1/2 / 3/4 / 1 benchmark strip — drag the marker to set the
 * result's own numerator (holding the current denominator) so the nearest-benchmark call stays live. */
export default function FractionBenchmarkGaugeCard() {
  const t = useTranslations("tools.fraction-calculator.education.benchmarkGauge");
  const { dims, setDim } = useFractionLive();
  const { numeratorA, denominatorA, numeratorB, denominatorB, operation } = dims;
  const valueA = numeratorA / (denominatorA || 1);
  const valueB = numeratorB / (denominatorB || 1);
  const result = operation === "add" ? valueA + valueB : operation === "subtract" ? valueA - valueB : operation === "multiply" ? valueA * valueB : valueB !== 0 ? valueA / valueB : 0;
  const position = benchmarkPosition(result);
  const nearest = BENCHMARKS.reduce((best, b) => (Math.abs(b - position) < Math.abs(best - position) ? b : best), 0);
  const nearestLabel = BENCHMARK_LABELS[BENCHMARKS.indexOf(nearest)];

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setDim("numeratorA", Math.round(frac * denominatorA));
  }

  return (
    <GlassIndicatorCard
      n={14}
      accent="mint"
      title={t("title")}
      subtitle={t("subtitle", { nearest: nearestLabel })}
      visual={
        <div className="flex w-56 flex-col gap-2">
          <div
            className="relative h-8 touch-none rounded-full bg-zinc-100 dark:bg-zinc-800"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
            onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
          >
            {BENCHMARKS.map((b, i) => (
              <div key={b} className="absolute top-0 h-full w-0.5 bg-zinc-300 dark:bg-zinc-600" style={{ left: `${b * 100}%` }}>
                <span className="absolute -top-4 -translate-x-1/2 text-[9px] text-zinc-400">{BENCHMARK_LABELS[i]}</span>
              </div>
            ))}
            <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1FC89C] ring-2 ring-white dark:ring-zinc-900" style={{ left: `${Math.max(0, Math.min(1, position)) * 100}%` }} />
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("result"), v: formatMathValue(result) },
            { k: t("nearestBenchmark"), v: nearestLabel },
            { k: t("distance"), v: formatMathValue(Math.abs(position - nearest)) },
          ]}
        />
      }
    />
  );
}
