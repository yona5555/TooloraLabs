"use client";
import { isValidElement, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { Hand, Minus, Plus, RotateCcw } from "lucide-react";
import SectionCard, { type PhoneRole } from "@/components/tool-ui/SectionCard";
import { GlassHandle, usePrefersReducedMotion, type HandleDirection } from "@/components/tool-ui/glass/GlassPrimitives";
import { hasWords, subParts } from "@/components/tool-ui/MixedText";
import { snap } from "./format";
import PhoneMini from "./PhoneMini";
import { Drawing } from "./SvgBits";

// Rule 2: the top mini card mirror, fetched only on phone.
const PhoneMiniMirror = lazy(() => import("./PhoneMiniMirror"));

/**
 * Shared kit for a tool's result visual + 8 indicator cards: one independent state hook per card, the
 * hold-to-repeat − / + / reset buttons (§43), the worked-example table (§42), the framed card
 * shell (§37, the site's SectionCard) and the drag-handle helpers (§40). Colours are tokens only.
 */

// ── Chemical markup ─────────────────────────────────────────────────────────────────
/**
 * Formulas are written in the messages with Unicode sub/superscripts (H₃O⁺, 10⁻⁶) or `X_y`;
 * on screen they render as real <sub>/<sup> (HTML) or shifted <tspan>s (SVG), never as the
 * small Unicode glyphs, which many fonts (Inter included) draw inconsistently.
 */
const SUB_CH: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "−" };
const SUP_CH: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "−", "ᵖ": "p", "ᴴ": "H", "ᴼ": "O" };
type ChemPart = { text: string; kind: "base" | "sub" | "sup" };
function chemParts(text: string): ChemPart[] {
  const out: ChemPart[] = [];
  for (const q of subParts(text)) {
    if (q.sub) {
      out.push({ text: q.text, kind: "sub" });
      continue;
    }
    for (const ch of q.text) {
      const kind = SUB_CH[ch] ? "sub" : SUP_CH[ch] ? "sup" : "base";
      const c = SUB_CH[ch] ?? SUP_CH[ch] ?? ch;
      const last = out[out.length - 1];
      if (last && last.kind === kind) last.text += c;
      else out.push({ text: c, kind });
    }
  }
  return out;
}

/** HTML: H₃O⁺ → H<sub>3</sub>O<sup>+</sup>. */
export function Chem({ text }: { text: string }): ReactNode {
  const parts = chemParts(text);
  if (parts.length === 1 && parts[0].kind === "base") return parts[0].text;
  return parts.map((p, i) => (p.kind === "sub" ? <sub key={i}>{p.text}</sub> : p.kind === "sup" ? <sup key={i}>{p.text}</sup> : <span key={i}>{p.text}</span>));
}

/** SVG (inside a <text>): sub/superscripts as shifted, smaller <tspan>s. */
export function SvgChem({ text }: { text: string }): ReactNode {
  const parts = chemParts(text);
  if (parts.length === 1 && parts[0].kind === "base") return parts[0].text;
  return parts.map((p, i) =>
    p.kind === "base" ? (
      <tspan key={i}>{p.text}</tspan>
    ) : (
      <tspan key={i} baselineShift={p.kind === "sub" ? "sub" : "super"} fontSize="72%">
        {p.text}
      </tspan>
    ),
  );
}

/**
 * Sentence text mixing words with formulas. Like MixedText, Latin/number runs are isolated LTR,
 * but sentence punctuation after a run (". , : ;") stays outside the isolate, so in Arabic the
 * full stop after "pOH" lands at the sentence end (left), not glued to the right of the run.
 */
const LTR_RUN = /[A-Za-z0-9\u00B2\u00B3\u00B9\u2070-\u209F\u1D2C-\u1D6A[\]()×·=+\-−–/%°→↔^.,:\s\u2066\u2069]+/g;
export function RichText({ text }: { text: string }) {
  if (!hasWords(text)) return <Chem text={text} />;
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(LTR_RUN)) {
    const i = m.index ?? 0;
    const raw = m[0];
    // Sentence punctuation on either side ("شكلين: C₁V₁") stays outside the LTR isolate.
    const core = raw.trim().replace(/[.,:;]+$/, "").replace(/^[.,:;]+\s*/, "");
    if (!/[A-Za-z0-9\u00B2\u00B3\u00B9\u2070-\u209F]/.test(core)) continue;
    const start = i + raw.indexOf(core);
    out.push(text.slice(last, start));
    out.push(
      <bdi key={k++} dir="ltr">
        <Chem text={core} />
      </bdi>,
    );
    last = start + core.length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

// ── State ─────────────────────────────────────────────────────────────────────────────
export type StepperSpec = { min: number; max: number; step: number };

/** One card's own value: seeded once, snapped to its step, flash counter for §42.3. */
export function useStepper(seed: number, { min, max, step }: StepperSpec) {
  const [value, setValue] = useState(() => snap(seed, step, min, max));
  const [flash, setFlash] = useState(0);
  const set = useCallback((v: number) => setValue(snap(v, step, min, max)), [step, min, max]);
  const inc = useCallback(() => setValue((v) => snap(v + step, step, min, max)), [step, min, max]);
  const dec = useCallback(() => setValue((v) => snap(v - step, step, min, max)), [step, min, max]);
  const initial = snap(seed, step, min, max);
  const reset = useCallback(() => setValue(initial), [initial]);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlash((f) => f + 1);
    }
  }, [value]);
  return { value, set, inc, dec, reset, flash, atMin: value <= min, atMax: value >= max, isSeed: value === initial, min, max, step };
}
export type Stepper = ReturnType<typeof useStepper>;

/**
 * Real pixel size of a drawing box: the SVGs are laid out in true pixels (viewBox = box size),
 * so text never shrinks on a phone and the marks always span the whole box (no letterboxing).
 */
export function useMeasuredSize<T extends HTMLElement>(fallback: { w: number; h: number }) {
  const ref = useRef<T>(null);
  const [size, setSize] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.max(240, Math.round(e.contentRect.width));
      const h = Math.round(e.contentRect.height) || fallback.h;
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback.h]);
  return [ref, size] as const;
}

// ── Buttons ───────────────────────────────────────────────────────────────────────────
function StepButton({ label, onStep, disabled, children, testId }: { label: string; onStep: () => void; disabled: boolean; children: ReactNode; testId: string }) {
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(onStep);
  useEffect(() => {
    stepRef.current = onStep;
  }, [onStep]);
  const stop = useCallback(() => {
    if (delay.current) clearTimeout(delay.current);
    if (repeat.current) clearInterval(repeat.current);
    delay.current = repeat.current = null;
  }, []);
  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (disabled) stop();
  }, [disabled, stop]);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-testid={testId}
      disabled={disabled}
      onPointerDown={(e) => {
        if (e.button !== 0 || disabled) return;
        stepRef.current();
        delay.current = setTimeout(() => {
          repeat.current = setInterval(() => stepRef.current(), 90);
        }, 420);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      // Keyboard (Enter/Space) clicks have detail 0; pointer presses were already handled above.
      onClick={(e) => {
        if (e.detail === 0) stepRef.current();
      }}
      className="flex h-11 w-11 shrink-0 touch-none select-none items-center justify-center rounded-full border-[1.5px] transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ borderColor: "var(--ph-accent-strong)", color: "var(--ph-accent-strong)", background: "var(--ph-accent-soft)", outlineColor: "var(--ph-focus)" }}
    >
      {children}
    </button>
  );
}

export function KitControls({ s, valueText, testId }: { s: Stepper; valueText: string; testId: string }) {
  const t = useTranslations("toolPage.indicatorKit");
  return (
    <div className="flex items-center justify-center gap-2" data-ph-controls={testId}>
      <StepButton label={t("minus")} onStep={s.dec} disabled={s.atMin} testId={`${testId}-minus`}>
        <Minus size={18} aria-hidden />
      </StepButton>
      <output
        dir="ltr"
        data-testid={`${testId}-value`}
        className="min-w-0 shrink basis-[6.5rem] rounded-full px-3 py-1.5 text-center text-sm font-bold tabular-nums"
        style={{ background: "var(--ph-surface)", color: "var(--ph-ink)" }}
      >
        <Chem text={valueText} />
      </output>
      <StepButton label={t("plus")} onStep={s.inc} disabled={s.atMax} testId={`${testId}-plus`}>
        <Plus size={18} aria-hidden />
      </StepButton>
      <button
        type="button"
        aria-label={t("reset")}
        title={t("reset")}
        data-testid={`${testId}-reset`}
        disabled={s.isSeed}
        onClick={s.reset}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ borderColor: "var(--ph-line)", color: "var(--ph-ink)", outlineColor: "var(--ph-focus)" }}
      >
        <RotateCcw size={17} aria-hidden />
      </button>
    </div>
  );
}

// ── Worked-example table ──────────────────────────────────────────────────────────────
/** `key` links the row to its part of the drawing (hover); several rows may share one. */
export type KitRow = { key: string; label: string; value: string; isKey?: boolean };

export function KitTable({ rows, flash, activeKey, onHover, caption }: { rows: KitRow[]; flash: number; activeKey: string | null; onHover: (k: string | null) => void; caption: string }) {
  const t = useTranslations("toolPage.indicatorKit");
  const reduced = usePrefersReducedMotion();
  return (
    <table className="h-full w-full border-collapse text-sm" data-ph-table>
      <caption className="pb-1.5 text-start text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--ph-ink-muted)" }}>
        {caption}
      </caption>
      <thead>
        <tr>
          <th scope="col" className="rounded-s-lg px-2.5 py-2 text-start font-bold" style={{ background: "var(--glass-table-header-bg)", color: "var(--ph-ink)" }}>
            {t("colQuantity")}
          </th>
          <th scope="col" className="rounded-e-lg px-2.5 py-2 text-end font-bold" style={{ background: "var(--glass-table-header-bg)", color: "var(--ph-ink)" }}>
            {t("colValue")}
          </th>
        </tr>
      </thead>
      <tbody key={flash}>
        {rows.map((r, i) => {
          const active = r.key === activeKey;
          return (
            <tr
              // r.key is the hover link to the drawing, and two rows may share one part (e.g. the given
              // value and the bar it feeds); the position keeps React's key unique.
              key={`${i}:${r.key}`}
              data-key={r.key}
              data-key-row={r.isKey ? "" : undefined}
              data-active={active ? "" : undefined}
              tabIndex={0}
              onPointerEnter={() => onHover(r.key)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onHover(r.key)}
              onBlur={() => onHover(null)}
              className={`outline-none ${flash > 0 && !reduced ? "glass-value-flash" : ""}`}
              style={{
                borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--glass-table-row-border)",
                background: r.isKey ? "var(--glass-key-row-bg)" : active ? "var(--glass-table-header-bg)" : undefined,
                boxShadow: active ? "inset 3px 0 0 var(--ph-focus)" : undefined,
              }}
            >
              <th scope="row" dir="auto" className="px-2.5 py-2.5 text-start font-medium" style={{ color: "var(--ph-ink)", fontWeight: r.isKey ? 700 : 500 }}>
                <RichText text={r.label} />
              </th>
              <td dir="ltr" className="px-2.5 py-2.5 text-end tabular-nums" style={{ color: "var(--ph-ink)", fontWeight: r.isKey ? 800 : 600 }}>
                <RichText text={r.value} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Card shell ────────────────────────────────────────────────────────────────────────
export function IndicatorCard({
  n,
  title,
  subtitle,
  visual,
  table,
  controls,
  caption,
  side,
  kind,
  idPrefix = "ph",
  phoneRole,
  mini,
}: {
  idPrefix?: string;
  phoneRole?: PhoneRole;
  /** Rule 2: this card is the page's chosen top mini card 0 or 1 on phone (PhoneMini), for a 2D
   *  visual that is not a kit Drawing (those are mirrored automatically). */
  mini?: 0 | 1;
  n: number;
  title: string;
  subtitle: string;
  visual: ReactNode;
  table: ReactNode;
  controls: ReactNode;
  caption: string;
  side: "visual-left" | "table-left";
  kind: "2d" | "3d";
}) {
  const t = useTranslations("toolPage.indicatorKit");
  const wrapRef = useRef<HTMLDivElement>(null);
  // Rule 2: a 2D card drawn with the shared Drawing can be mirrored in a phone top mini card.
  const miniOk = kind === "2d" && isValidElement(visual) && visual.type === Drawing;
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    if (!miniOk) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const read = () => setPhone(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, [miniOk]);
  return (
    <div ref={wrapRef} data-ph-visual data-ph-card={n} data-ph-kind={kind} data-ph-mini-ok={miniOk ? "" : undefined} data-card-side={side} className="leading-normal" style={{ fontFamily: "var(--glass-font)" }}>
      {phone && (
        <Suspense fallback={null}>
          <PhoneMiniMirror title={<RichText text={title} />} visual={visual} source={wrapRef} />
        </Suspense>
      )}
      <SectionCard
        phoneRole={phoneRole}
        id={`${idPrefix}-card-${n}`}
        title={<RichText text={title} />}
        action={
          <span role="img" aria-label={t("interactive")} title={t("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
            <Hand size={15} aria-hidden />
          </span>
        }
      >
        <p dir="auto" className="text-sm leading-6" style={{ color: "var(--ph-ink-muted)" }}>
          <RichText text={subtitle} />
        </p>
        <div className={`mt-4 flex flex-col gap-4 lg:items-stretch ${side === "visual-left" ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
          <figure className="m-0 flex min-w-0 flex-col gap-3 lg:basis-[57%]" data-ph-figure>
            <div data-ph-drawing dir="ltr" className="relative flex w-full flex-1 flex-col">
              {mini === undefined ? (
                visual
              ) : (
                <PhoneMini slot={mini} title={<RichText text={title} />} label={title}>
                  {visual}
                </PhoneMini>
              )}
            </div>
            {controls}
            <figcaption dir="auto" className="text-center text-xs leading-5" style={{ color: "var(--ph-ink-muted)" }}>
              <RichText text={caption} />
            </figcaption>
          </figure>
          <div className="flex min-w-0 flex-col lg:basis-[43%]" data-ph-table-col>
            <div className="flex flex-1 flex-col rounded-xl p-3" style={{ background: "var(--glass-table-wrap-bg)" }}>
              {table}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Drag helpers ──────────────────────────────────────────────────────────────────────
/** Pointer drag over an SVG: reports the pointer in viewBox units while the button is held. */
export function useSvgDrag(svgRef: RefObject<SVGSVGElement | null>, viewW: number, viewH: number, onPoint: (x: number, y: number) => void) {
  const dragging = useRef(false);
  const cb = useRef(onPoint);
  useEffect(() => {
    cb.current = onPoint;
  }, [onPoint]);
  const report = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    cb.current(((e.clientX - r.left) / r.width) * viewW, ((e.clientY - r.top) / r.height) * viewH);
  };
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      report(e);
      e.preventDefault();
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (dragging.current) report(e);
    },
    onPointerUp: () => {
      dragging.current = false;
    },
    onPointerCancel: () => {
      dragging.current = false;
    },
  };
}

/** A GlassHandle placed over an SVG point given in viewBox units (positioned in %). */
export function SvgHandle({
  x,
  y,
  viewW,
  viewH,
  direction,
  label,
  valueText,
  s,
  drag,
  testId,
}: {
  x: number;
  y: number;
  viewW: number;
  viewH: number;
  direction: HandleDirection;
  label: string;
  valueText: string;
  s: Stepper;
  drag: Pick<ReturnType<typeof useSvgDrag>, "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel">;
  testId: string;
}) {
  const style: CSSProperties = { left: `${(x / viewW) * 100}%`, top: `${(y / viewH) * 100}%`, transform: "translate(-50%, -50%)" };
  return (
    <div {...drag} data-testid={testId} className="absolute h-11 w-11" style={style}>
      <GlassHandle
        direction={direction}
        valueText={valueText}
        ariaLabel={label}
        onStep={(d) => (d > 0 ? s.inc() : s.dec())}
        valueNow={s.value}
        valueMin={s.min}
        valueMax={s.max}
        style={{ left: 0, top: 0 }}
      />
    </div>
  );
}

/** Horizontal custom track (no native range input): rounded bar, filled part, GlassHandle. */
export function KitTrack({ s, label, valueText, testId, ticks }: { s: Stepper; label: string; valueText: string; testId: string; ticks?: { at: number; text: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
  const report = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    s.set(s.min + ((e.clientX - r.left) / r.width) * (s.max - s.min));
  };
  return (
    <div dir="ltr" className="px-6 pt-1">
      <div
        ref={ref}
        data-testid={testId}
        className="relative h-11 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          report(e);
        }}
        onPointerMove={(e) => dragging.current && report(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full" style={{ background: "var(--glass-track)", border: "1px solid var(--ph-line)" }} />
        <div className="absolute start-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full" style={{ width: `${pct}%`, background: "var(--ph-accent-strong)" }} />
        <GlassHandle
          direction="horizontal"
          ariaLabel={label}
          onStep={(d) => (d > 0 ? s.inc() : s.dec())}
          valueNow={s.value}
          valueMin={s.min}
          valueMax={s.max}
          valueText={valueText}
          style={{ left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}
        />
        <span className="sr-only">{valueText}</span>
      </div>
      {ticks && (
        <div data-ph-ticks className="relative mt-0.5 h-4 text-xs tabular-nums" style={{ color: "var(--ph-ink-muted)" }}>
          {ticks.map((tk, i) => (
            <span
              key={tk.at}
              className={`absolute whitespace-nowrap ${i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
              style={{ left: `${((tk.at - s.min) / (s.max - s.min)) * 100}%` }}
            >
              {tk.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
