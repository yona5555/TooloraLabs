"use client";
import { useTranslations } from "next-intl";
import { mul2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

const W = 340;
const H = 230;
const TOP = 24;
const BOTTOM = 196;
const LABELS = ["₁₁", "₁₂", "₂₁", "₂₂"];

/** Type #1 (Labeled Bar Chart): each entry of A×B beside the same entry of B×A — unequal pairs show order matters. */
export default function MatrixCommutativityBars() {
  const t = useTranslations("tools.matrix-calculator.education.lab.commutativity");
  const { A, B, f, fm } = useMatrixModel();
  const AB = mul2(A, B);
  const BA = mul2(B, A);
  const all = [...AB, ...BA];
  const max = Math.max(1e-9, ...all.map((v) => Math.max(0, v)));
  const min = Math.min(0, ...all);
  const span = max - min || 1;
  const y = (v: number) => TOP + ((max - v) / span) * (BOTTOM - TOP);
  const zero = y(0);
  const commute = AB.every((v, i) => Math.abs(v - BA[i]) < 1e-9);
  const groupW = (W - 20) / 4;

  const chart = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      <line x1={10} x2={W - 10} y1={zero} y2={zero} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" />
      {LABELS.map((lab, i) => {
        const gx = 10 + i * groupW + groupW / 2;
        const bars = [
          { v: AB[i], cls: "fill-violet-500 dark:fill-violet-400", dx: -26 },
          { v: BA[i], cls: "fill-teal-500 dark:fill-teal-400", dx: 2 },
        ];
        return (
          <g key={lab}>
            {bars.map((b, k) => {
              const top = Math.min(y(b.v), zero);
              const h = Math.max(1.5, Math.abs(y(b.v) - zero));
              return (
                <g key={k}>
                  <rect x={gx + b.dx} y={top} width={24} height={h} rx={3} className={b.cls} />
                  <text x={gx + b.dx + 12} y={b.v >= 0 ? top - 4 : top + h + 11} textAnchor="middle" className="fill-zinc-700 font-mono text-[10px] font-semibold dark:fill-zinc-200">{f(b.v, 2)}</text>
                </g>
              );
            })}
            <text x={gx} y={H - 16} textAnchor="middle" className="fill-zinc-500 font-mono text-[11px] dark:fill-zinc-400">{`[ ]${lab}`}</text>
          </g>
        );
      })}
      <rect x={14} y={H - 10} width={10} height={8} className="fill-violet-500 dark:fill-violet-400" />
      <text x={28} y={H - 3} className="fill-zinc-600 text-[10px] dark:fill-zinc-300">A×B</text>
      <rect x={70} y={H - 10} width={10} height={8} className="fill-teal-500 dark:fill-teal-400" />
      <text x={84} y={H - 3} className="fill-zinc-600 text-[10px] dark:fill-zinc-300">B×A</text>
    </svg>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={chart}
      rows={[
        { label: "A×B", value: fm(AB) },
        { label: "B×A", value: fm(BA) },
        { label: "A×B − B×A", value: fm(AB.map((v, i) => v - BA[i]) as typeof AB) },
        { label: t("verdict"), value: commute ? t("commute") : t("noCommute"), emphasize: true },
      ]}
    />
  );
}
