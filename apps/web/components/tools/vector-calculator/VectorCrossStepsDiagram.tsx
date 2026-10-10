"use client";
import { useTranslations } from "next-intl";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

/** §31 #13 Stepped Diagram: the three 2×2 determinants of A×B, then its length (the parallelogram area). */
export default function VectorCrossStepsDiagram() {
  const t = useTranslations("tools.vector-calculator.indicators.crossSteps");
  const tr = useTranslations("tools.vector-calculator.live3d.rows");
  const { r, f, n } = useVectorAnalysis();
  const [ax, ay, az] = r.a;
  const [bx, by, bz] = r.b;
  const steps = [
    { label: t("stepX"), sym: "ay·bz − az·by", sub: `${n(ay)}×${n(bz)} − ${n(az)}×${n(by)}`, value: f(r.cross[0]) },
    { label: t("stepY"), sym: "az·bx − ax·bz", sub: `${n(az)}×${n(bx)} − ${n(ax)}×${n(bz)}`, value: f(r.cross[1]) },
    { label: t("stepZ"), sym: "ax·by − ay·bx", sub: `${n(ax)}×${n(by)} − ${n(ay)}×${n(bx)}`, value: f(r.cross[2]) },
    { label: t("stepMag"), sym: "√(x² + y² + z²)", sub: `√(${r.cross.map((c) => `${n(c)}²`).join(" + ")})`, value: f(r.crossMag) },
  ];

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <ol className="w-[300px] space-y-2 sm:w-[400px]">
          {steps.map((s, i) => (
            <li key={i} style={{ marginInlineStart: `${i * 22}px` }} className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${i === 3 ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${i === 3 ? "bg-rose-600" : "bg-blue-600"}`}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{s.label}</p>
                <p dir="ltr" className="truncate text-start font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{s.sym} = {s.sub}</p>
              </div>
              <span dir="ltr" className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50">{s.value}</span>
            </li>
          ))}
        </ol>
      }
      rows={[
        { label: tr("vectorA"), value: `(${n(ax)}, ${n(ay)}, ${n(az)})` },
        { label: tr("vectorB"), value: `(${n(bx)}, ${n(by)}, ${n(bz)})` },
        { label: tr("cross"), value: `(${r.cross.map((c) => f(c)).join(", ")})` },
        { label: tr("crossMag"), value: f(r.crossMag), emphasize: true },
        { label: tr("triangleArea"), value: f(r.triangleArea) },
      ]}
    />
  );
}
