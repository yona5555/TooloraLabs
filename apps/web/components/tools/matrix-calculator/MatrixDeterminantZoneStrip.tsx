"use client";
import { useTranslations } from "next-intl";
import { det2, detZone, mul2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

const W = 340;
const X0 = 20;
const X1 = W - 20;

/**
 * Type #19 (Zone Strip): a signed-log axis cut into the five things a determinant can say —
 * flips orientation, collapses to a line, shrinks, keeps area, expands — with det A, det B and
 * det(A×B) pinned where they fall.
 */
export default function MatrixDeterminantZoneStrip() {
  const t = useTranslations("tools.matrix-calculator.education.lab.detZones");
  const { A, B, f } = useMatrixModel();
  const dA = det2(A);
  const dB = det2(B);
  const dAB = det2(mul2(A, B));
  const M = Math.max(10, Math.abs(dA), Math.abs(dB), Math.abs(dAB));
  const L = Math.log10(1 + M);
  const x = (d: number) => X0 + ((Math.sign(d) * Math.log10(1 + Math.abs(d))) / L + 1) * ((X1 - X0) / 2);
  const mid = x(0);
  const one = x(1);

  const markers = [
    { key: "A", v: dA, cls: "fill-blue-600 dark:fill-blue-400", y: 34 },
    { key: "B", v: dB, cls: "fill-orange-500 dark:fill-orange-400", y: 20 },
    { key: "AB", v: dAB, cls: "fill-violet-600 dark:fill-violet-400", y: 6 },
  ];

  const strip = (
    <svg style={{ direction: "ltr" }} width={W} height={170} viewBox={`0 0 ${W} 170`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      <rect x={X0} y={70} width={mid - X0 - 2} height={30} className="fill-rose-400/70 dark:fill-rose-500/50" rx={4} />
      <rect x={mid - 2} y={70} width={4} height={30} className="fill-zinc-500" />
      <rect x={mid + 2} y={70} width={one - mid - 3} height={30} className="fill-amber-300/80 dark:fill-amber-500/50" />
      <rect x={one - 1} y={70} width={2} height={30} className="fill-zinc-700 dark:fill-zinc-200" />
      <rect x={one + 1} y={70} width={X1 - one - 1} height={30} className="fill-emerald-400/70 dark:fill-emerald-500/50" rx={4} />
      <text x={(X0 + mid) / 2} y={90} textAnchor="middle" className="fill-rose-900 text-[11px] font-semibold dark:fill-rose-100">{t("zones.flip")}</text>
      <text x={(one + X1) / 2} y={90} textAnchor="middle" className="fill-emerald-900 text-[11px] font-semibold dark:fill-emerald-100">{t("zones.expand")}</text>
      {[-M, -1, 0, 1, M].map((v) => (
        <text key={v} x={x(v)} y={116} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">{f(v, 1)}</text>
      ))}
      <text x={(mid + one) / 2} y={132} textAnchor="middle" className="fill-amber-700 text-[10px] font-semibold dark:fill-amber-300">{t("zones.shrink")}</text>
      {markers.map((m) => (
        <g key={m.key} transform={`translate(${x(m.v)}, 0)`}>
          <line x1={0} y1={m.y + 10} x2={0} y2={70} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
          <circle cx={0} cy={70} r={4} className={m.cls} />
          <text x={0} y={m.y + 6} textAnchor="middle" className={`${m.cls} font-mono text-[11px] font-bold`}>{`${m.key}: ${f(m.v)}`}</text>
        </g>
      ))}
      <text x={W / 2} y={158} textAnchor="middle" className="fill-zinc-400 text-[10px] dark:fill-zinc-500">{t("axis")}</text>
    </svg>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={strip}
      rows={[
        { label: "det A", value: `${f(dA)} · ${t(`zones.${detZone(dA)}`)}`, emphasize: true },
        { label: "det B", value: `${f(dB)} · ${t(`zones.${detZone(dB)}`)}` },
        { label: "det (A×B)", value: `${f(dAB)} · ${t(`zones.${detZone(dAB)}`)}` },
        { label: t("areaFactor"), value: `×${f(Math.abs(dA))}` },
      ]}
    />
  );
}
