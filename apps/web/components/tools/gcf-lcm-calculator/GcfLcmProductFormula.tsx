"use client";
import { useTranslations } from "next-intl";
import { gcd2, lcm2, primeExponentTable } from "@tooloralabs/tools";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { sup, useGcfLcmModel } from "./GcfLcmLiveContext";

/**
 * Type #18 (Formula Diagram): GCF(a, b) × LCM(a, b) = a × b on the first two live numbers, with the
 * reason underneath — for every prime, min + max of the two exponents is just their sum.
 */
export default function GcfLcmProductFormula() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.formula");
  const { a, b, f } = useGcfLcmModel();
  const g = gcd2(a, b);
  const l = lcm2(a, b);
  const table = primeExponentTable([a, b]);

  const box = (label: string, value: string, tone: string) => (
    <div className={`flex min-w-[4.5rem] flex-col items-center rounded-xl px-3 py-2 ${tone}`}>
      <span className="text-[10px] font-semibold tracking-wide uppercase opacity-80">{label}</span>
      <span className="font-mono text-lg font-bold">{value}</span>
    </div>
  );
  const op = (s: string) => <span className="font-mono text-xl font-bold text-zinc-400">{s}</span>;

  const diagram = (
    <div dir="ltr" className="w-full lg:w-[340px]">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {box("GCF", f(g), "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200")}
        {op("×")}
        {box("LCM", f(l), "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200")}
        {op("=")}
        {box("a", f(a), "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200")}
        {op("×")}
        {box("b", f(b), "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200")}
      </div>
      <p className="mt-2 text-center font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-200">{`${f(g * l)} = ${f(a * b)}`}</p>
      <table className="mt-3 w-full text-center font-mono text-xs">
        <thead>
          <tr className="text-zinc-400">
            <th className="py-1">p</th>
            <th>a</th>
            <th>b</th>
            <th className="text-emerald-600 dark:text-emerald-400">min</th>
            <th className="text-violet-600 dark:text-violet-400">max</th>
            <th>min+max</th>
          </tr>
        </thead>
        <tbody>
          {table.slice(0, 5).map((r) => (
            <tr key={r.prime} className="border-t border-zinc-100 text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
              <td className="py-1 font-bold">{f(r.prime)}</td>
              <td>{f(r.exponents[0])}</td>
              <td>{f(r.exponents[1])}</td>
              <td className="text-emerald-700 dark:text-emerald-300">{f(r.min)}</td>
              <td className="text-violet-700 dark:text-violet-300">{f(r.max)}</td>
              <td className="font-bold">{`${f(r.min + r.max)} = ${f(r.exponents[0])}+${f(r.exponents[1])}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={diagram}
      rows={[
        { label: t("pair"), value: `a = ${f(a)}, b = ${f(b)}` },
        { label: "GCF(a, b)", value: f(g) },
        { label: "LCM(a, b)", value: f(l) },
        { label: "GCF × LCM", value: `${f(g)} × ${f(l)} = ${f(g * l)}` },
        { label: "a × b", value: `${f(a)} × ${f(b)} = ${f(a * b)}` },
        { label: t("shortcut"), value: `${f(a * b)} ÷ ${f(g)} = ${f(l)}`, emphasize: true },
        { label: t("exponents"), value: table.map((r) => `${f(r.prime)}${sup(r.min)}·${f(r.prime)}${sup(r.max)}`).join(" ") || f(1) },
      ]}
    />
  );
}
