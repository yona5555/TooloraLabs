"use client";
import { useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Chem, KitControls, KitTrack, SvgChem, useMeasuredSize, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { uniFormula } from "../chemical-equation-balancer/chemMath";
import { SvgMolecule } from "../chemical-equation-balancer/Molecules2D";
import { g3 } from "../molarity-calculator/molMath";
import { fromLog, LOG_MAX, LOG_MIN, LOG_STEP, TICKS, tickText, toLog } from "./stoichMath";
import { gridDims, INSET, MAX_SHOWN, ROLE_TOKEN, shownCount, type StoSceneProps } from "./StoichiometryResultScene3D";

const Scene3D = dynamic(() => import("./StoichiometryResultScene3D"), { ssr: false, loading: () => null });

/** 2D twin of the 3D reaction (no WebGL or no free slot): the same molecules, drawn flat. */
function Scene2D({ p, label }: { p: StoSceneProps; label: string }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 380, h: 214 });
  const nR = p.items.filter((i) => i.side === "reactant").length;
  const slots = p.items.length + 1;
  const sw = (W * (1 - 2 * INSET)) / slots;
  const xAt = (slot: number) => W * INSET + sw * (slot + 0.5);
  const top = 40;
  const availH = H - top - 10;
  const cy = top + availH / 2;
  const ax = xAt(nR);
  return (
    <div ref={box} dir="ltr" className="absolute inset-0">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={label}>
        {p.items.map((it, i) => {
          const x = xAt(i < nR ? i : i + 1);
          const n = shownCount(it.coefficient);
          const { cols, rows } = gridDims(n);
          const gap = Math.min((sw * 0.9) / cols, availH / rows, 90);
          return (
            <g key={i}>
              <text x={x} y={cy - (rows / 2) * gap - 8} fontSize={16} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
                <SvgChem text={`${it.coefficient > 1 ? it.coefficient : ""}${uniFormula(it.formula)}`} />
              </text>
              {Array.from({ length: n }, (_, j) => {
                const row = Math.floor(j / cols);
                const inRow = row === rows - 1 ? n - row * cols : cols;
                return <SvgMolecule key={j} formula={it.formula} x={x + ((j % cols) - (inRow - 1) / 2) * gap} y={cy + (row - (rows - 1) / 2) * gap} size={gap / 1.3} />;
              })}
              {it.coefficient > MAX_SHOWN && (
                <text x={x} y={cy + (rows / 2) * gap + 4} fontSize={13} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
                  {`×${it.coefficient}`}
                </text>
              )}
            </g>
          );
        })}
        <line x1={ax - sw * 0.3} x2={ax + sw * 0.22} y1={cy} y2={cy} style={{ stroke: "var(--ph-ink)" }} strokeWidth={3} strokeLinecap="round" />
        <path d={`M ${ax + sw * 0.3} ${cy} l -11 -7 l 0 14 z`} style={{ fill: "var(--ph-ink)" }} />
        <text x={ax} y={cy - 12} fontSize={14} fontWeight={800} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
          {p.ratio}
        </text>
      </svg>
    </div>
  );
}

/** Bar length on a log scale of the mass (0.01 g … 10 000 000 g), so it never grows long. */
const barPct = (mass: number) => (mass > 0 ? Math.min(100, Math.max(6, ((Math.log10(mass) + 2) / 9) * 100)) : 0);

/**
 * §44: the reaction scene at the top of the stoichiometry Result card — the balanced equation, each
 * substance as ball-and-stick molecules (count = its coefficient), the mole ratio on the arrow, the
 * mass and amount under each substance (co-reactants marked as required), and a horizontal log
 * handle under the reactants that writes the known amount into the calculator (the field moves it back).
 */
export default function StoichiometryResultScene({
  p,
  equation,
  valid,
  format,
  amount,
  unit,
  seed,
  onSetAmount,
}: {
  p: StoSceneProps;
  equation: string;
  valid: boolean;
  /** The Result card's number formatter (scientific notation with a real superscript ≥ 1 000 000). */
  format: (v: number) => ReactNode;
  amount: number;
  unit: string;
  seed: number;
  onSetAmount: (v: number) => void;
}) {
  const t = useTranslations("tools.stoichiometry-calculator.visuals.hero");
  const value = Math.round(toLog(amount) * 100) / 100;
  const set = useCallback((x: number) => onSetAmount(fromLog(x)), [onSetAmount]);
  const s: Stepper = {
    value,
    set,
    inc: () => set(value + LOG_STEP * 2),
    dec: () => set(value - LOG_STEP * 2),
    reset: () => onSetAmount(seed),
    flash: 0,
    atMin: value <= LOG_MIN,
    atMax: value >= LOG_MAX,
    isSeed: Math.abs(amount - seed) < 1e-9,
    min: LOG_MIN,
    max: LOG_MAX,
    step: LOG_STEP,
  };
  const valueText = `${g3(amount)} ${unit}`;
  const label = t("handle");
  const nR = p.items.filter((i) => i.side === "reactant").length;
  // The handle spans the reactant slots (plus half the arrow slot), so it sits under the reactants.
  const handleWidth = `${Math.min(100, ((nR + 0.5) / (p.items.length + 1)) * 100)}%`;
  const cells = [...p.items.slice(0, nR), null, ...p.items.slice(nR)];

  return (
    <div data-ph-scene-block className="flex flex-col gap-2">
      <p dir="ltr" data-testid="sto-hero-equation" className="text-center text-2xl font-bold leading-tight" style={{ color: "var(--ph-ink)" }}>
        <Chem text={equation} />
      </p>
      <ViewportScene
        testId="sto-hero"
        className="aspect-video max-h-[240px] w-full sm:max-h-[300px]"
        fallback={<Scene2D p={p} label={equation} />}
        render3d={() => (
          <div className="absolute inset-0" dir="ltr" data-testid="sto-hero-3d">
            <Scene3D {...p} />
          </div>
        )}
      />
      <div dir="ltr" data-testid="sto-hero-values" className="grid w-full gap-x-1" style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`, paddingInline: `${INSET * 100}%` }}>
        {cells.map((it, i) =>
          it ? (
            <div key={i} data-sto-substance={it.formula} className="flex min-w-0 flex-col items-center gap-0.5 text-center" style={{ containerType: "inline-size" }}>
              {it.role === "co" && valid && (
                <span data-testid="sto-required" className="rounded-full px-1.5 text-[11px] font-bold leading-5" style={{ color: "var(--ph-ink)", border: "1px solid var(--ph-line)" }}>
                  {t("required")}
                </span>
              )}
              <span className="max-w-full font-extrabold leading-tight tabular-nums break-words" style={{ color: "var(--ph-ink)", fontSize: "clamp(0.72rem, 12.5cqi, 1.05rem)" }}>
                {valid ? <>{format(it.mass)} g</> : "—"}
              </span>
              <span className="max-w-full font-semibold leading-tight tabular-nums break-words" style={{ color: "var(--ph-ink-muted)", fontSize: "clamp(0.68rem, 10.5cqi, 0.9rem)" }}>
                {valid ? <>{format(it.moles)} mol</> : "—"}
              </span>
              <span aria-hidden className="mt-0.5 block h-1.5 w-full max-w-[72px] overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--ph-line) 45%, transparent)" }}>
                <span className="block h-full rounded-full" style={{ width: `${valid ? barPct(it.mass) : 0}%`, background: `var(${ROLE_TOKEN[it.role]})` }} />
              </span>
            </div>
          ) : (
            <div key={i} />
          ),
        )}
      </div>
      <div dir="ltr" className="w-full">
        <div style={{ width: handleWidth, minWidth: "min(100%, 240px)" }}>
          <KitTrack s={s} label={label} valueText={valueText} testId="sto-hero-handle" ticks={TICKS.map((e) => ({ at: e, text: tickText(e) }))} />
        </div>
      </div>
      <KitControls s={s} valueText={valueText} testId="sto-hero" />
    </div>
  );
}
