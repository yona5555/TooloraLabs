"use client";
import { useTranslations } from "next-intl";
import type { Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { INK, LINE, MUTED, px2, SvgLabel as T, axisTicks } from "@/components/tool-ui/indicator-kit/SvgBits";
import { Drawing, useDrawing } from "@/components/tool-ui/indicator-kit/Drawing";
import { formatBytes } from "./formatBytes";

export type SweepPoint = { q: number; size: number };

const HMIN = 190;
const PAD = { l: 58, r: 18, t: 16, b: 30 };

/**
 * The converted file's size across the whole quality range, from real encodes of this image at
 * 10, 20 … 100 % (plus the live conversion at the current quality), with the original's size as a
 * reference line. Its handle rides the curve and writes the shared quality value. Takes the Result
 * card's spare height (§41).
 */
export default function ImageQualityCurve({ s, points, current, originalSize, formatLabel }: { s: Stepper; points: SweepPoint[]; current: number; originalSize: number; formatLabel: string }) {
  const t = useTranslations("tools.image-converter.visuals.result");
  const d = useDrawing(HMIN, s, (x, _y, W) => 10 + ((x - PAD.l) / (W - PAD.l - PAD.r)) * 90);
  const { W, H } = d;
  const pts = [...points.filter((p) => p.q !== s.value), ...(current > 0 ? [{ q: s.value, size: current }] : [])].sort((a, b) => a.q - b.q);
  const top = Math.max(originalSize, ...pts.map((p) => p.size)) * 1.08 || 1;
  const x = (q: number) => PAD.l + ((q - 10) / 90) * (W - PAD.l - PAD.r);
  const y = (b: number) => H - PAD.b - (b / top) * (H - PAD.t - PAD.b);
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${px2(x(p.q))} ${px2(y(p.size))}`).join(" ");
  const area = pts.length > 1 ? `${path} L ${px2(x(pts[pts.length - 1].q))} ${H - PAD.b} L ${px2(x(pts[0].q))} ${H - PAD.b} Z` : "";
  // Round KB / MB gridlines (axisTicks on kilobytes, so labels read 100 KB, 200 KB …).
  const yTicks = axisTicks(0, top / 1024, H - PAD.t - PAD.b, 34).filter((v) => v * 1024 < top);
  const kb = (v: number) => (v >= 1024 ? `${Number((v / 1024).toPrecision(3))} MB` : `${v} KB`);
  const hy = current > 0 ? y(current) : H - PAD.b;
  const valueText = `Q ${s.value} %: ${current > 0 ? formatBytes(current) : "…"}`;
  return (
    <div dir="ltr" className="flex flex-1 flex-col" data-testid="image-curve">
      <p className="mb-1 text-center text-xs font-semibold" style={{ color: "var(--ph-ink)" }}>
        {t("curveTitle", { format: formatLabel })}
      </p>
      <Drawing {...d} hMin={HMIN} label={t("curveHandle")} valueText={valueText} handle={{ x: x(s.value), y: hy, dir: "horizontal" }} s={s} testId="image-curve">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={px2(y(v * 1024))} y2={px2(y(v * 1024))} style={LINE} strokeWidth={1} strokeDasharray="3 4" />
            <T x={PAD.l - 6} y={px2(y(v * 1024)) + 4} text={kb(v)} anchor="end" size={12} style={MUTED} />
          </g>
        ))}
        {[10, 25, 50, 75, 100].map((q) => (
          <T key={q} x={px2(x(q))} y={H - 10} text={`${q}`} size={12} style={MUTED} />
        ))}
        {originalSize > 0 && (
          <g>
            <line x1={PAD.l} x2={W - PAD.r} y1={px2(y(originalSize))} y2={px2(y(originalSize))} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={1.5} />
            {/* Left end unless the quality marker sits there (the curve's steep top end is on the right). */}
            {x(s.value) > PAD.l + 120 ? (
              <T x={PAD.l + 4} y={px2(y(originalSize)) - 5} text={`${t("original")} ${formatBytes(originalSize)}`} anchor="start" size={12} style={INK} />
            ) : (
              <T x={W - PAD.r - 40} y={px2(y(originalSize)) - 5} text={`${t("original")} ${formatBytes(originalSize)}`} anchor="end" size={12} style={INK} />
            )}
          </g>
        )}
        {area && <path d={area} style={{ fill: "var(--cv-to)" }} opacity={0.16} />}
        {path && <path d={path} fill="none" style={{ stroke: "var(--cv-to)" }} strokeWidth={2.5} strokeLinejoin="round" />}
        {pts.map((p) => (
          <circle key={p.q} cx={px2(x(p.q))} cy={px2(y(p.size))} r={p.q === s.value ? 0 : 3} style={{ fill: "var(--cv-to)" }} />
        ))}
        <line x1={px2(x(s.value))} x2={px2(x(s.value))} y1={PAD.t} y2={H - PAD.b} style={{ stroke: "var(--cv-from)" }} strokeWidth={1.5} strokeDasharray="4 3" />
        {current > 0 && (
          <T
            x={px2(x(s.value) > W - PAD.r - 70 ? x(s.value) - 8 : x(s.value) + 8)}
            y={px2(Math.max(PAD.t + 10, hy - 24))}
            text={formatBytes(current)}
            anchor={x(s.value) > W - PAD.r - 70 ? "end" : "start"}
            size={12}
            bold
            style={{ fill: "var(--cv-from)" }}
          />
        )}
      </Drawing>
    </div>
  );
}
