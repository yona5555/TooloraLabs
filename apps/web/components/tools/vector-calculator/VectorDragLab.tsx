"use client";
import { Coordinates, Mafs, MovablePoint, Polygon, Text, Theme, Vector } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useTranslations } from "next-intl";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

function niceStep(span: number): number {
  const raw = span / 5;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

const clean = (v: number) => String(Number(v.toPrecision(10)));

/**
 * The "wow" piece: drag the tips of A and B in the xy-plane. Each move writes back to the tool's
 * own inputs, so the Result table, 3D view and every indicator on the page follow live.
 */
export default function VectorDragLab() {
  const t = useTranslations("tools.vector-calculator.indicators.dragLab");
  const tr = useTranslations("tools.vector-calculator.live3d.rows");
  const { r, dims, setDim, f, vf, deg } = useVectorAnalysis();
  const [ax, ay] = r.a;
  const [bx, by] = r.b;
  const reach = Math.max(4, ...[ax, ay, bx, by, r.sum[0], r.sum[1]].map(Math.abs));
  const step = niceStep(reach * 2);
  const L = Math.ceil((reach * 1.15) / step) * step;
  const snap = step / 2;
  const fit = (v: number) => Math.max(-L, Math.min(L, Math.round(v / snap) * snap));
  const proj = r.projAonB;

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div className="w-[300px] sm:w-[380px]">
          <div dir="ltr" className="mafs-canvas overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Mafs viewBox={{ x: [-L, L], y: [-L, L] }} preserveAspectRatio="contain" height={320} pan={false} zoom={false}>
              <Coordinates.Cartesian xAxis={{ lines: step }} yAxis={{ lines: step }} subdivisions={false} />
              <Polygon points={[[0, 0], [ax, ay], [r.sum[0], r.sum[1]], [bx, by]]} color={Theme.violet} fillOpacity={0.14} weight={1} />
              <Vector tip={[r.sum[0], r.sum[1]]} color={Theme.violet} weight={2.5} />
              {proj && <Vector tip={[proj[0], proj[1]]} color={Theme.orange} weight={4} />}
              <Vector tip={[ax, ay]} color={Theme.blue} weight={3} />
              <Vector tip={[bx, by]} color={Theme.green} weight={3} />
              <Text x={ax} y={ay} attach="ne" attachDistance={14} color={Theme.blue} size={15}>A</Text>
              <Text x={bx} y={by} attach="se" attachDistance={14} color={Theme.green} size={15}>B</Text>
              <Text x={r.sum[0]} y={r.sum[1]} attach="ne" attachDistance={10} color={Theme.violet} size={13}>A+B</Text>
              <MovablePoint point={[ax, ay]} color={Theme.blue} onMove={([x, y]) => { setDim("ax", clean(fit(x))); setDim("ay", clean(fit(y))); }} />
              <MovablePoint point={[bx, by]} color={Theme.green} onMove={([x, y]) => { setDim("bx", clean(fit(x))); setDim("by", clean(fit(y))); }} />
            </Mafs>
          </div>
          <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint", { az: dims.az || "0", bz: dims.bz || "0" })}</p>
        </div>
      }
      rows={[
        { label: tr("vectorA"), value: vf(r.a) },
        { label: tr("vectorB"), value: vf(r.b) },
        { label: tr("dot"), value: f(r.dot) },
        { label: tr("cross"), value: vf(r.cross) },
        { label: tr("angleDeg"), value: deg(r.angleDeg) },
        { label: tr("crossMag"), value: f(r.crossMag), emphasize: true },
      ]}
    />
  );
}
