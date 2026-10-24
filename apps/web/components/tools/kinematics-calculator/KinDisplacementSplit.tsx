"use client";
import { useLocale, useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import KinIndicatorCard, { KinIndicatorUnavailable } from "./KinIndicatorCard";
import { r2, useKinModel } from "./KinLiveContext";

const W = 400;
const H = 190;
const L = 16;
const R = 384;
const ROWS = [34, 82, 130] as const;
const BAR = 24;

/**
 * Type #15 (Stacked Segmented Bar): the displacement split into its two parts, Δx = v₀t + ½at² —
 * what the starting speed alone would cover plus what the acceleration adds (or removes, when
 * braking) — laid end to end on one axis, with the net Δx and the total path length below.
 */
export default function KinDisplacementSplit() {
  const t = useTranslations("tools.kinematics-calculator.education.lab.split");
  const rtl = useLocale() === "ar";
  const { k, f } = useKinModel();
  if (!k || k.span <= 0) return <KinIndicatorUnavailable title={t("title")} />;

  const a1 = k.dxFromV0;
  const a2 = k.dxFromA;
  const net = a1 + a2;
  const lo = Math.min(0, a1, net);
  const hi = Math.max(0, a1, net, k.pathLength);
  const px = (v: number) => r2(L + (hi - lo > 1e-12 ? ((v - lo) / (hi - lo)) * (R - L) : 0));
  const seg = (from: number, to: number) => ({ x: Math.min(px(from), px(to)), w: Math.max(1.5, Math.abs(px(to) - px(from))) });
  const s1 = seg(0, a1);
  const s2 = seg(a1, net);
  const sn = seg(0, net);
  const sp = seg(0, k.pathLength);

  const label = (x: number, w: number, y: number, text: string, cls: string, words = false) => (
    <text x={r2(Math.min(R - 4, Math.max(L + 4, x + w / 2)))} y={y - 6} textAnchor="middle" direction={words && rtl ? "rtl" : "ltr"} fontSize={10.5} fontWeight={700} className={cls}>{text}</text>
  );

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      <line x1={px(0)} y1={ROWS[0] - 4} x2={px(0)} y2={ROWS[2] + BAR + 4} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
      {/* row 1: v₀t then ½at² laid end to end */}
      <rect x={s1.x} y={ROWS[0]} width={s1.w} height={BAR} rx={3} className="fill-sky-500 dark:fill-sky-400" />
      <rect x={s2.x} y={ROWS[0] + (a2 < 0 ? BAR / 2 : 0)} width={s2.w} height={a2 < 0 ? BAR / 2 : BAR} rx={3} className={a2 < 0 ? "fill-amber-500 dark:fill-amber-400" : "fill-violet-500 dark:fill-violet-400"} />
      {label(s1.x, s1.w, ROWS[0], `v₀t = ${f(a1, 1)}`, "fill-sky-700 dark:fill-sky-300")}
      <text x={r2(Math.min(R - 4, Math.max(L + 4, s2.x + s2.w / 2)))} y={ROWS[0] + BAR + 13} textAnchor="middle" fontSize={10.5} fontWeight={700} className={a2 < 0 ? "fill-amber-700 dark:fill-amber-300" : "fill-violet-700 dark:fill-violet-300"}>{`½at² = ${f(a2, 1)}`}</text>
      {/* row 2: the net displacement */}
      <rect x={sn.x} y={ROWS[1] + 8} width={sn.w} height={BAR} rx={3} className="fill-blue-600 dark:fill-blue-400" />
      {label(sn.x, sn.w, ROWS[1] + 8, `Δx = ${f(net, 1)} m`, "fill-blue-700 dark:fill-blue-300")}
      {/* row 3: total path length */}
      <rect x={sp.x} y={ROWS[2] + 12} width={sp.w} height={BAR / 2} rx={3} className="fill-zinc-400 dark:fill-zinc-500" />
      {label(sp.x, sp.w, ROWS[2] + 12, `${t("path")} = ${ltr(`${f(k.pathLength, 1)} m`)}`, "fill-zinc-600 dark:fill-zinc-300", true)}
    </svg>
  );

  const share = Math.abs(a1) + Math.abs(a2) > 0 ? Math.abs(a2) / (Math.abs(a1) + Math.abs(a2)) : 0;
  return (
    <KinIndicatorCard
      mini={0}
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("fromV0"), value: `${f(k.v0)} × ${f(k.span)} = ${f(a1)} m` },
        { label: t("fromA"), value: `½ × ${f(k.a)} × ${f(k.span)}² = ${f(a2)} m` },
        { label: t("net"), value: `${f(a1)} + (${f(a2)}) = ${f(net)} m`, emphasize: true },
        { label: t("share"), value: `${f(share * 100, 1)}%`, note: k.turning ? t("turnNote") : undefined },
      ]}
    />
  );
}
