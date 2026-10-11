"use client";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import KinIndicatorCard, { KinIndicatorUnavailable } from "./KinIndicatorCard";
import { useKinModel } from "./KinLiveContext";

/**
 * Type #18 (Formula Diagram): the four constant-acceleration equations, each written symbolically,
 * then with the live numbers substituted, both sides evaluated and checked. All four agree for
 * any solved set; when time is undefined only v² = v₀² + 2aΔx applies.
 */
export default function KinEquationsDiagram() {
  const t = useTranslations("tools.kinematics-calculator.education.lab.equations");
  const tq = useTranslations("tools.kinematics-calculator.aboveFold.quickReference.formulas");
  const { k, f } = useKinModel();
  if (!k) return <KinIndicatorUnavailable title={t("title")} />;

  const [v0, v, a, tt, dx] = [f(k.v0), f(k.v), f(k.a), f(k.t), f(k.dx)];
  const sub: Record<string, string> = {
    velocity: `${v} = ${v0} + ${a} × ${tt}`,
    displacementTime: `${dx} = ${v0} × ${tt} + ½ × ${a} × ${tt}²`,
    velocitySquared: `${v}² = ${v0}² + 2 × ${a} × ${dx}`,
    displacementAvg: `${dx} = ½ × (${v0} + ${v}) × ${tt}`,
  };

  const diagram = (
    <div className="grid w-full max-w-[400px] grid-cols-1 gap-2">
      {k.checks.map((c) => (
        <div key={c.key} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{tq(`${c.key}.label`)}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-bold ${c.holds ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {c.holds ? <Check size={14} /> : <X size={14} />}
            </span>
          </div>
          <p dir="ltr" className="mt-1 font-mono text-sm font-bold text-blue-700 dark:text-blue-300">{tq(`${c.key}.expression`)}</p>
          <p dir="ltr" className="font-mono text-xs text-zinc-500 [overflow-wrap:anywhere] dark:text-zinc-400">{sub[c.key]}</p>
          <p dir="ltr" className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-100">{`${f(c.lhs, 3)} ${c.holds ? "=" : "≠"} ${f(c.rhs, 3)}`}</p>
        </div>
      ))}
    </div>
  );

  const passed = k.checks.filter((c) => c.holds).length;
  return (
    <KinIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={diagram}
      rows={[
        { label: t("known"), value: `v₀ = ${v0} m/s · a = ${a} m/s²` },
        { label: t("time"), value: k.tAvailable ? `t = ${tt} s` : t("noTime") },
        { label: t("displacement"), value: `Δx = ${dx} m` },
        { label: t("agree"), value: `${passed} / ${k.checks.length}`, emphasize: true, note: t("agreeNote") },
      ]}
    />
  );
}
