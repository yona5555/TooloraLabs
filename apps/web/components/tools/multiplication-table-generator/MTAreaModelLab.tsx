"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Coordinates, Mafs, Polygon, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { mtFriendlySplit } from "@tooloralabs/tools";
import IndicatorCard from "@/components/tools/markets/IndicatorCard";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import type { MtView, PickFact } from "./types";

type Vec = [number, number];
const LIGHT = { point: "#059669", low: "#2563eb", high: "#8b5cf6", text: "#18181b" };
const DARK = { point: "#34d399", low: "#60a5fa", high: "#a78bfa", text: "#fafafa" };

/**
 * §36 drag lab — the area model: the rectangle from the origin to the green handle has b columns and
 * a rows, so its area is a × b. The rows are cut at the friendly split of a (tens / five) and each
 * band is labelled with its partial product. Dragging the handle picks a new fact for the whole page.
 */
export default function MTAreaModelLab({ view, onPick }: { view: MtView; onPick: PickFact }) {
  const t = useTranslations("tools.multiplication-table-generator.ind");
  const c = useIsDarkMode() ? DARK : LIGHT;
  const board = Math.max(12, Math.min(20, Math.max(view.a, view.b)));
  const clamp = (v: number) => Math.min(board, Math.max(1, Math.round(v)));

  const handle = useMovablePoint([clamp(view.b), clamp(view.a)] as Vec, {
    color: c.point,
    constrain: (p) => [clamp(p[0]), clamp(p[1])],
  });

  // Two-way sync: page → handle when the inputs change, handle → page when the visitor drags.
  const last = useRef<Vec>([clamp(view.b), clamp(view.a)]);
  const fromProps = useRef(false);
  useEffect(() => {
    const target: Vec = [clamp(view.b), clamp(view.a)];
    if (target[0] !== last.current[0] || target[1] !== last.current[1]) {
      fromProps.current = true;
      last.current = target;
      handle.setPoint(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the page's fact changes
  }, [view.a, view.b, board]);
  useEffect(() => {
    if (fromProps.current) {
      fromProps.current = false;
      return;
    }
    const [x, y] = [clamp(handle.point[0]), clamp(handle.point[1])];
    if (x !== last.current[0] || y !== last.current[1]) {
      last.current = [x, y];
      onPick(y, x);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reacts to the handle only
  }, [handle.point]);

  const cols = clamp(handle.point[0]);
  const rows = clamp(handle.point[1]);
  const [r1, r2] = mtFriendlySplit(rows);
  const outside = view.a > board || view.b > board;
  const f = view.fmt;

  return (
    <IndicatorCard
      id="area-model"
      title={t("area.title")}
      heading={t("area.heading", { a: f(rows), b: f(cols) })}
      intro={t("area.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("area.rowFact"), value: `${f(rows)} × ${f(cols)}` },
          { label: t("area.rowSplit"), value: r2 ? `${f(rows)} = ${f(r1)} + ${f(r2)}` : `${f(rows)} = ${f(r1)}` },
          { label: t("area.rowLow"), value: `${f(r1)} × ${f(cols)} = ${f(r1 * cols)}` },
          { label: t("area.rowHigh"), value: `${f(r2)} × ${f(cols)} = ${f(r2 * cols)}` },
          { label: t("area.rowCommute"), value: `${f(cols)} × ${f(rows)} = ${f(rows * cols)}` },
          { label: t("area.rowPerimeter"), value: `2 × (${f(rows)} + ${f(cols)}) = ${f(2 * (rows + cols))}` },
          { label: t("area.rowBoard"), value: `${f(rows * cols)} ÷ ${f(board * board)} = ${f(Math.round(((rows * cols) / (board * board)) * 1000) / 10)}%` },
          { label: t("area.rowSquare"), value: `${f(Math.round(Math.sqrt(rows * cols)))}² = ${f(Math.round(Math.sqrt(rows * cols)) ** 2)}` },
          { label: t("area.rowResult"), value: `${f(r1 * cols)} + ${f(r2 * cols)} = ${f(rows * cols)}`, emphasize: true, note: outside ? t("area.outside", { size: board }) : undefined },
        ],
      }}
    >
      <div dir="ltr" className="mafs-canvas overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700" data-testid="mt-area" data-rows={rows} data-cols={cols}>
        <Mafs height={300} viewBox={{ x: [-0.6, board + 0.6], y: [-0.6, board + 0.6] }} preserveAspectRatio={false} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ lines: 1, labels: (n) => (n % 2 === 0 && n > 0 ? String(n) : "") }} yAxis={{ lines: 1, labels: (n) => (n % 2 === 0 && n > 0 ? String(n) : "") }} />
          <Polygon points={[[0, 0], [cols, 0], [cols, r1], [0, r1]]} color={c.low} fillOpacity={0.35} weight={2} />
          {r2 > 0 && <Polygon points={[[0, r1], [cols, r1], [cols, rows], [0, rows]]} color={c.high} fillOpacity={0.35} weight={2} />}
          <Text x={cols / 2} y={r1 / 2} size={cols >= 4 ? 16 : 12} color={c.text}>
            {`${r1}×${cols}=${r1 * cols}`}
          </Text>
          {r2 > 0 && (
            <Text x={cols / 2} y={r1 + r2 / 2} size={cols >= 4 ? 16 : 12} color={c.text}>
              {`${r2}×${cols}=${r2 * cols}`}
            </Text>
          )}
          {handle.element}
        </Mafs>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
          <i className="inline-block h-3 w-3 rounded-sm" style={{ background: c.low }} />
          {t("area.legendLow", { n: f(r1) })}
        </span>
        {r2 > 0 && (
          <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
            <i className="inline-block h-3 w-3 rounded-sm" style={{ background: c.high }} />
            {t("area.legendHigh", { n: f(r2) })}
          </span>
        )}
        <span className="ms-auto rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{t("area.dragHint")}</span>
      </div>
    </IndicatorCard>
  );
}
