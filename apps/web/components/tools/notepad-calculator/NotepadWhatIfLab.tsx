"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Coordinates, Mafs, Point, Polyline, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { sweepVariable, valueWithOverride, type NotepadAnalysis } from "@tooloralabs/tools";
import IndicatorCard, { PillGroup } from "@/components/tools/markets/IndicatorCard";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { compact, lineNo, niceStep, num, pct, signed } from "./format";

type Vec = [number, number];
type Props = { a: NotepadAnalysis; text: string; variable: string | null; onVariable: (name: string) => void; onApply: (line: number, value: number) => void };

/** Range the input is explored over: zero to twice its typed value (or ±10 around zero). */
function domainOf(v: number): [number, number] {
  if (v > 0) return [0, v * 2];
  if (v < 0) return [v * 2, 0];
  return [-10, 10];
}

/**
 * The page's "wow" piece (§31 type 20, §36): the bottom line plotted against one input, with a
 * draggable point that re-runs the whole notepad at every position — the curve is the real
 * evaluator, not a fit. "Apply to notes" writes the dragged value back into the input's line.
 */
export default function NotepadWhatIfLab({ a, text, variable, onVariable, onApply }: Props) {
  const t = useTranslations("tools.notepad-calculator.ind");
  const inputs = a.variables.filter((v) => v.isInput && v.line < a.finalIndex);
  const v = inputs.find((x) => x.name === variable) ?? inputs[0];
  const ok = Boolean(v) && a.finalValue !== null;

  return (
    <IndicatorCard
      id="what-if"
      title={t("lab.title")}
      heading={t("lab.heading", { name: v?.name ?? "—", line: lineNo(a.finalIndex) })}
      intro={t("lab.intro")}
      controls={inputs.length > 1 ? <PillGroup label={t("pickInput")} options={inputs.map((x) => x.name)} value={v?.name ?? ""} onChange={onVariable} /> : undefined}
      fallback={ok ? undefined : <p className="mt-4 rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{t("noInputs")}</p>}
      worked={null}
    >
      {ok && v && <Lab key={`${v.name}|${text}`} a={a} text={text} name={v.name} base={v.value} line={v.line} onApply={onApply} />}
    </IndicatorCard>
  );
}

function Lab({ a, text, name, base, line, onApply }: { a: NotepadAnalysis; text: string; name: string; base: number; line: number; onApply: Props["onApply"] }) {
  const t = useTranslations("tools.notepad-calculator.ind");
  const isDark = useIsDarkMode();
  const f0 = a.finalValue as number;
  const [x0, x1] = domainOf(base);
  const at = (x: number) => valueWithOverride(text, a.finalIndex, name, x);

  const samples = useMemo(() => sweepVariable(text, a.finalIndex, name, Array.from({ length: 81 }, (_, i) => x0 + ((x1 - x0) * i) / 80)), [text, a.finalIndex, name, x0, x1]);
  // Cap extreme values (e.g. near a division by zero) so the useful part of the curve stays readable.
  const finite = samples.filter((s) => s.y !== null).map((s) => s.y as number);
  const sorted = [...finite].sort((p, q) => p - q);
  const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))] ?? f0;
  let y0 = Math.min(q(0.05), f0, 0);
  let y1 = Math.max(q(0.95), f0, 0);
  if (y1 - y0 < 1e-9) {
    y0 -= 1;
    y1 += 1;
  }
  const pad = (y1 - y0) * 0.12;
  y0 -= pad;
  y1 += pad;
  const segments: Vec[][] = [];
  let cur: Vec[] = [];
  for (const s of samples) {
    if (s.y === null || s.y < y0 - (y1 - y0) || s.y > y1 + (y1 - y0)) {
      if (cur.length > 1) segments.push(cur);
      cur = [];
    } else cur.push([s.x, s.y]);
  }
  if (cur.length > 1) segments.push(cur);

  const clamp = (x: number) => Math.min(x1, Math.max(x0, x));
  const point = useMovablePoint([base, f0], {
    color: isDark ? "#34d399" : "#059669",
    constrain: ([px]) => {
      const cx = clamp(px);
      return [cx, at(cx) ?? f0];
    },
  });
  const [px, py] = point.point;
  const delta = py - f0;
  const xStep = niceStep(x1 - x0, 6);
  const yStep = niceStep(y1 - y0, 5);
  const blue = isDark ? "#60a5fa" : "#2563eb";
  const grey = isDark ? "#a1a1aa" : "#71717a";

  const rows = [
    { label: t("lab.rowTyped", { name }), value: num(base) },
    { label: t("lab.rowDragged", { name }), value: num(px) },
    { label: t("lab.rowBottomTyped"), value: num(f0) },
    { label: t("lab.rowBottomNow"), value: num(py) },
    { label: t("lab.rowDelta"), value: `${signed(delta)}${f0 ? ` (${pct((delta / Math.abs(f0)) * 100)})` : ""}`, emphasize: true },
  ];

  return (
    <div className="@container" data-testid="ind-lab">
      <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-stretch">
        <div className="min-w-0 flex-1">
          <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" data-testid="lab-x">{`${name} = ${num(px)}`}</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" data-testid="lab-y">{`${lineNo(a.finalIndex)} = ${num(py)}`}</span>
            <span className={`rounded-full px-2.5 py-1 font-mono text-xs font-semibold ${delta >= 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"}`}>{signed(delta)}</span>
          </div>
          <div dir="ltr" aria-label={t("lab.aria")} className="mafs-canvas w-full overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: [x0, x1], y: [y0, y1], padding: 0 }} height={280} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: xStep, labels: (n) => compact(n) }} yAxis={{ lines: yStep, labels: (n) => compact(n) }} />
              {segments.map((seg, i) => (
                <Polyline key={i} points={seg} color={blue} weight={3} />
              ))}
              <Point x={base} y={f0} color={grey} />
              <Text x={base} y={f0} attach="n" attachDistance={14} size={11} color={grey}>
                {t("lab.typed")}
              </Text>
              {point.element}
            </Mafs>
          </div>
          <label className="mt-3 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="shrink-0">{t("lab.slider")}</span>
            <input
              type="range"
              dir="ltr"
              min={x0}
              max={x1}
              step={(x1 - x0) / 200}
              value={px}
              onChange={(e) => {
                const nx = clamp(Number(e.target.value));
                point.setPoint([nx, at(nx) ?? f0]);
              }}
              className="w-full accent-emerald-600"
              data-testid="lab-slider"
            />
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("lab.hint")}</p>
        </div>
        <div className="flex flex-col gap-3 @3xl:w-80 @3xl:shrink-0">
          <div className="flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("worked")}</p>
            <dl className="mt-3 space-y-2 text-sm">
              {rows.map((r, i) => (
                <div key={i} className={`flex items-baseline justify-between gap-3 ${r.emphasize ? "border-t border-zinc-200 pt-2 dark:border-zinc-700" : ""}`}>
                  <dt className="text-zinc-500 dark:text-zinc-400">{r.label}</dt>
                  <dd dir="ltr" className={`font-mono font-semibold ${r.emphasize ? "text-base text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}>
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <button
            type="button"
            onClick={() => onApply(line, Math.round(px * 100) / 100)}
            disabled={Math.abs(px - base) < 1e-9}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="lab-apply"
          >
            {t("lab.apply", { name, value: num(Math.round(px * 100) / 100) })}
          </button>
        </div>
      </div>
    </div>
  );
}
