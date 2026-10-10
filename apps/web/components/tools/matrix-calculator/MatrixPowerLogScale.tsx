"use client";
import { useTranslations } from "next-intl";
import { det2, detPowers2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

const W = 340;
const ROW = 28;
const LEFT = 44;
const RIGHT = 16;
const N = 6;

/**
 * Type #10 (Log-Scale Magnitude Bar): the area factor of A applied k times, |det(Aᵏ)| = |det A|ᵏ,
 * on a log axis — a determinant above 1 explodes, below 1 fades toward 0, exactly 1 stays flat.
 */
export default function MatrixPowerLogScale() {
  const t = useTranslations("tools.matrix-calculator.education.lab.powers");
  const { A, f } = useMatrixModel();
  const d = det2(A);
  const pw = detPowers2(A, N);
  const logs = pw.map((p) => (Math.abs(p.det) > 0 ? Math.log10(Math.abs(p.det)) : null));
  const finite = logs.filter((v): v is number => v !== null);
  const lo = Math.floor(Math.min(0, ...finite));
  const hi = Math.max(lo + 1, Math.ceil(Math.max(1, ...finite)));
  const H = N * ROW + 46;
  const sx = (l: number) => LEFT + ((l - lo) / (hi - lo)) * (W - LEFT - RIGHT);
  const ticks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((_, i, arr) => arr.length <= 7 || i % Math.ceil(arr.length / 6) === 0);
  const sup = (n: number) => String(n).replace(/-/g, "⁻").replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]);
  const tone = Math.abs(d) > 1 ? "fill-emerald-500 dark:fill-emerald-400" : Math.abs(d) < 1 ? "fill-amber-500 dark:fill-amber-400" : "fill-blue-500 dark:fill-blue-400";

  const chart = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      {ticks.map((p) => (
        <g key={p}>
          <line x1={sx(p)} x2={sx(p)} y1={8} y2={N * ROW + 12} strokeWidth={1} strokeDasharray="2 3" className="stroke-zinc-300 dark:stroke-zinc-700" />
          <text x={sx(p)} y={N * ROW + 28} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">{`10${sup(p)}`}</text>
        </g>
      ))}
      {pw.map((p, i) => {
        const y = 10 + i * ROW;
        const l = logs[i];
        const end = l === null ? sx(lo) : sx(l);
        return (
          <g key={p.k}>
            <text x={LEFT - 8} y={y + 15} textAnchor="end" className="fill-zinc-600 font-mono text-[11px] font-semibold dark:fill-zinc-300">{`A${sup(p.k)}`}</text>
            <rect x={sx(lo)} y={y + 3} width={Math.max(2, end - sx(lo))} height={ROW - 10} rx={4} className={tone} />
            <text x={Math.min(end + 4, W - RIGHT - 2)} y={y + 15} textAnchor={end + 60 > W - RIGHT ? "end" : "start"} className="fill-zinc-800 font-mono text-[10px] font-bold dark:fill-zinc-100">{f(Math.abs(p.det), 4)}</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 4} textAnchor="middle" className="fill-zinc-400 text-[10px] dark:fill-zinc-500">{t("axis")}</text>
    </svg>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={chart}
      rows={[
        { label: "det A", value: f(d) },
        { label: "det A²", value: `${f(d)}² = ${f(pw[1].det, 4)}` },
        { label: "det A³", value: `${f(d)}³ = ${f(pw[2].det, 4)}` },
        { label: `det A${sup(N)}`, value: `${f(d)}${sup(N)} = ${f(pw[N - 1].det, 4)}`, emphasize: true },
        { label: t("trend"), value: Math.abs(d) > 1 ? t("grows") : Math.abs(d) < 1e-12 ? t("collapses") : Math.abs(d) < 1 ? t("fades") : t("steady") },
      ]}
    />
  );
}
