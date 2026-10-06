"use client";
import { useTranslations } from "next-intl";
import { GlassHandle, GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue, benchmarkPosition } from "@tooloralabs/tools";

const BENCHMARKS = [0, 0.25, 0.5, 0.75, 1];
const BENCHMARK_LABELS = ["0", "1/4", "1/2", "3/4", "1"];

/** The live result placed on a 0 / 1/4 / 1/2 / 3/4 / 1 benchmark strip — drag the marker to set the
 * result's own numerator (holding the current denominator) so the nearest-benchmark call stays live. */
export default function FractionBenchmarkGaugeCard() {
  const t = useTranslations("tools.fraction-calculator.education.benchmarkGauge");
  const tCommon = useTranslations("common");
  const { dims, setDim } = useFractionCardState();
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
        <div className="flex w-full flex-col justify-center gap-2 pt-6">
          <div
            className="relative h-12 touch-none rounded-full"
            style={{ background: "var(--glass-track)" }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
            onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
          >
            {BENCHMARKS.map((b, i) => (
              <div key={b} className="absolute top-0 h-full w-0.5" style={{ left: `${b * 100}%`, background: "var(--glass-border)" }}>
                <span className="absolute -top-6 -translate-x-1/2 text-xs font-semibold" style={{ color: "var(--glass-muted)" }}>
                  {BENCHMARK_LABELS[i]}
                </span>
              </div>
            ))}
            <GlassHandle
              direction="horizontal"
              ariaLabel={tCommon("dragToChange")}
              onStep={(delta) => setDim("numeratorA", Math.max(0, numeratorA + delta))}
              style={{ left: `${Math.max(0, Math.min(1, position)) * 100}%`, top: "50%", transform: "translate(-50%, -50%)" }}
            />
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
