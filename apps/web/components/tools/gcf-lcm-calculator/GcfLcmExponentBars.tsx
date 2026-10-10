"use client";
import { useTranslations } from "next-intl";
import { primeExponentTable } from "@tooloralabs/tools";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { sup, useGcfLcmModel } from "./GcfLcmLiveContext";

const W = 340;
const H = 220;
const PAD_L = 26;
const PAD_B = 34;
const PAD_T = 16;
const MAX_PRIMES = 6;
const BAR_COLORS = ["fill-blue-500 dark:fill-blue-400", "fill-amber-500 dark:fill-amber-400", "fill-cyan-500 dark:fill-cyan-400", "fill-pink-500 dark:fill-pink-400", "fill-lime-500 dark:fill-lime-400"];

/**
 * Type #1 (Labeled Bar Chart): for each prime, one bar per number at the height of its exponent.
 * The green tick marks the smallest exponent (what the GCF keeps), the violet tick the largest
 * (what the LCM keeps).
 */
export default function GcfLcmExponentBars() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.exponents");
  const { nums, result, f } = useGcfLcmModel();
  const full = primeExponentTable(nums);
  const table = full.slice(0, MAX_PRIMES);
  const maxE = Math.max(1, ...table.flatMap((r) => r.exponents));
  const plotH = H - PAD_B - PAD_T;
  const groupW = (W - PAD_L - 6) / Math.max(1, table.length);
  const barW = Math.max(4, Math.min(18, (groupW - 10) / nums.length));
  const y = (e: number) => PAD_T + plotH - (e / maxE) * plotH;

  const chart = (
    <div className="w-full lg:w-[340px]">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} className="mx-auto block max-w-full" role="img" aria-label={t("title")}>
        {Array.from({ length: maxE + 1 }, (_, e) => (
          <g key={e}>
            <line x1={PAD_L} x2={W - 4} y1={y(e)} y2={y(e)} className="stroke-zinc-200 dark:stroke-zinc-700" />
            <text x={PAD_L - 6} y={y(e) + 3} textAnchor="end" className="fill-zinc-400 font-mono text-[10px]">{f(e)}</text>
          </g>
        ))}
        {table.map((r, gi) => {
          const gx = PAD_L + gi * groupW + (groupW - barW * nums.length) / 2;
          const x0 = PAD_L + gi * groupW + 3;
          return (
            <g key={r.prime}>
              {r.exponents.map((e, i) => (
                <g key={i}>
                  <rect x={gx + i * barW} y={y(e)} width={barW - 2} height={Math.max(0, y(0) - y(e))} rx={2} className={BAR_COLORS[i % BAR_COLORS.length]} />
                  <text x={gx + i * barW + (barW - 2) / 2} y={y(e) - 3} textAnchor="middle" className="fill-zinc-700 font-mono text-[10px] font-semibold dark:fill-zinc-200">{f(e)}</text>
                </g>
              ))}
              <line x1={x0} x2={x0 + groupW - 6} y1={y(r.min)} y2={y(r.min)} strokeWidth={2.5} strokeDasharray="5 3" className="stroke-emerald-600 dark:stroke-emerald-400" />
              <line x1={x0} x2={x0 + groupW - 6} y1={y(r.max)} y2={y(r.max)} strokeWidth={2.5} strokeDasharray="2 3" className="stroke-violet-600 dark:stroke-violet-400" />
              <text x={PAD_L + gi * groupW + groupW / 2} y={H - PAD_B + 16} textAnchor="middle" className="fill-zinc-800 font-mono text-[12px] font-bold dark:fill-zinc-100">{f(r.prime)}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        {nums.map((n, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <svg width={10} height={10}><rect width={10} height={10} rx={2} className={BAR_COLORS[i % BAR_COLORS.length]} /></svg>
            <span dir="ltr" className="font-mono">{f(n)}</span>
          </span>
        ))}
        <span className="font-semibold text-emerald-700 dark:text-emerald-300">– – {t("minLine")}</span>
        <span className="font-semibold text-violet-700 dark:text-violet-300">··· {t("maxLine")}</span>
      </div>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={chart}
      rows={[
        ...table.map((r) => ({ label: t("prime", { p: f(r.prime) }), value: `${r.exponents.map((e) => f(e)).join(", ")} → ${f(r.min)} | ${f(r.max)}` })),
        { label: "GCF", value: `${full.filter((r) => r.min > 0).map((r) => `${f(r.prime)}${sup(r.min)}`).join(" × ") || f(1)} = ${f(result.gcf)}`, emphasize: true },
        { label: "LCM", value: `${full.map((r) => `${f(r.prime)}${sup(r.max)}`).join(" × ")} = ${f(result.lcm)}`, emphasize: true },
      ]}
    />
  );
}
