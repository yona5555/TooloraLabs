"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import type { HarmonyType, PaletteColor } from "@tooloralabs/tools";
import { KitControls, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { GlassHandle } from "@/components/tool-ui/glass/GlassPrimitives";
import { px2 } from "@/components/tool-ui/indicator-kit/SvgBits";
import { ltr } from "@/components/tool-ui/MixedText";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { contrast, hexOfHsl, hsl, hueName, offsetsOf, WHITE, BLACK, wrap360 } from "./paletteMath";
import { hexToRgb } from "@tooloralabs/tools";

/**
 * Result-card main visual (§44, 2D, geometric — no illustration needed): the HSL colour wheel at the
 * base colour's own saturation and lightness, with every palette colour marked at its real hue and
 * joined into the harmony's shape. Dragging the base marker (or −/+/reset) rotates the real base hue,
 * so the whole palette and page follow.
 */
const SEGMENTS = 120;

function Chip({ color, label }: { color: PaletteColor; label: string }) {
  const { copied, copy } = useCopyToClipboard();
  const rgb = hexToRgb(color.hex) ?? WHITE;
  const ink = contrast(rgb, WHITE) >= contrast(rgb, BLACK) ? "var(--color-white)" : "var(--color-black)";
  return (
    <button
      type="button"
      onClick={() => copy(color.hex)}
      title={label}
      aria-label={`${label} ${color.hex}`}
      className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 px-1 font-mono text-[11px] font-bold transition hover:brightness-110"
      style={{ background: color.hex, color: ink }}
    >
      <span dir="ltr" className="truncate">{color.hex.toUpperCase()}</span>
      {copied ? <Check size={12} className="shrink-0" /> : <Copy size={12} className="shrink-0 opacity-70" />}
    </button>
  );
}

export default function PaletteWheel({
  baseHex,
  anchorHex,
  harmony,
  palette,
  onRotate,
}: {
  baseHex: string;
  anchorHex: string;
  harmony: HarmonyType;
  palette: PaletteColor[];
  onRotate: (hex: string) => void;
}) {
  const t = useTranslations("tools.color-palette-generator.aboveFold.wheel");
  const tH = useTranslations("tools.color-palette-generator.form.harmony");
  const tN = useTranslations("tools.color-palette-generator.hueNames");
  const base = hsl(baseHex);
  const hue = Math.round(base.h);
  const anchorHue = Math.round(hsl(anchorHex).h);
  const [touched, setTouched] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const setHue = (h: number) => onRotate(hexOfHsl({ h: wrap360(Math.round(h)), s: base.s, l: base.l }));
  const s: Stepper = {
    value: hue,
    set: setHue,
    inc: () => setHue(hue + 5),
    dec: () => setHue(hue - 5),
    reset: () => onRotate(anchorHex),
    flash: 0,
    atMin: false,
    atMax: false,
    isSeed: baseHex.toLowerCase() === anchorHex.toLowerCase() || hue === anchorHue,
    min: 0,
    max: 359,
    step: 5,
  };

  const W = 320;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2;
  const R = 128;
  const RW = 30;
  const at = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x: px2(cx + r * Math.cos(a)), y: px2(cy + r * Math.sin(a)) };
  };
  const seg = (i: number) => {
    const a0 = (i * 360) / SEGMENTS;
    const a1 = ((i + 1) * 360) / SEGMENTS + 0.6;
    const o0 = at(a0, R);
    const o1 = at(a1, R);
    const i1 = at(a1, R - RW);
    const i0 = at(a0, R - RW);
    return `M ${o0.x} ${o0.y} A ${R} ${R} 0 0 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${R - RW} ${R - RW} 0 0 0 ${i0.x} ${i0.y} Z`;
  };

  const offsets = offsetsOf(harmony);
  const mono = harmony === "monochromatic";
  const markers = palette.map((c, i) => {
    const h = mono ? hue : wrap360(hue + offsets[i]);
    const r = mono ? R - RW - 8 - i * ((R - RW - 40) / Math.max(1, palette.length - 1)) : R - RW / 2;
    return { c, h, ...at(h, r) };
  });
  const handlePt = at(hue, R + 20);

  function hueAt(clientX: number, clientY: number) {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((clientX - r.left) / r.width) * W - cx;
    const y = ((clientY - r.top) / r.height) * H - cy;
    setHue(wrap360((Math.atan2(y, x) * 180) / Math.PI + 90));
  }

  return (
    <div data-ph-scene-block data-ph-hero className="flex flex-col gap-2">
      <div className="flex w-full flex-col gap-3" data-testid="cp-wheel">
        <div
          className="relative mx-auto w-full max-w-[420px] touch-none select-none"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            dragging.current = true;
            setTouched(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            hueAt(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => dragging.current && hueAt(e.clientX, e.clientY)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          style={{ cursor: "grab" }}
        >
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={t("aria", { hue: String(hue) })}>
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <path key={i} d={seg(i)} fill={`hsl(${(i * 360) / SEGMENTS} ${base.s.toFixed(1)}% ${base.l.toFixed(1)}%)`} />
            ))}
            <circle cx={cx} cy={cy} r={R - RW - 2} style={{ fill: "var(--ph-surface)" }} />
            {!mono && markers.length > 1 && (
              <polygon points={markers.map((m) => `${m.x},${m.y}`).join(" ")} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={2} strokeDasharray="5 4" opacity={0.75} />
            )}
            {mono && <line x1={cx} y1={cy} x2={at(hue, R - RW).x} y2={at(hue, R - RW).y} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} />}
            {markers.map((m, i) => (
              <g key={i}>
                <circle cx={m.x} cy={m.y} r={i === (mono ? 2 : offsets.indexOf(0)) ? 12 : 9} fill={m.c.hex} style={{ stroke: "var(--ph-surface)" }} strokeWidth={3} />
                <circle cx={m.x} cy={m.y} r={i === (mono ? 2 : offsets.indexOf(0)) ? 14 : 11} fill="none" style={{ stroke: "var(--ph-ink)" }} strokeWidth={1.2} />
              </g>
            ))}
            <circle cx={cx} cy={cy} r={34} fill={baseHex.startsWith("#") ? baseHex : `#${baseHex}`} style={{ stroke: "var(--ph-line)" }} strokeWidth={1.5} />
            <text x={cx} y={cy - 46} textAnchor="middle" fontSize={12} fontWeight={800} paintOrder="stroke" strokeWidth={5} strokeLinejoin="round" style={{ fill: "var(--ph-ink)", stroke: "var(--ph-surface)" }}>
              {tH(harmony)}
            </text>
            <text x={cx} y={cy + 54} textAnchor="middle" fontSize={11} fontWeight={700} className="tabular-nums" paintOrder="stroke" strokeWidth={5} strokeLinejoin="round" style={{ fill: "var(--ph-ink-muted)", stroke: "var(--ph-surface)" }} direction="ltr">
              {`${hue}° · ${Math.round(base.s)}% · ${Math.round(base.l)}%`}
            </text>
          </svg>
          <GlassHandle
            direction="circular"
            ariaLabel={t("handle")}
            onStep={(d) => {
              setTouched(true);
              return d > 0 ? s.inc() : s.dec();
            }}
            valueNow={hue}
            valueMin={0}
            valueMax={359}
            style={{ left: `${(handlePt.x / W) * 100}%`, top: `${(handlePt.y / H) * 100}%`, transform: "translate(-50%, -50%)", opacity: touched ? 1 : undefined }}
          />
        </div>
        <div dir="ltr" className="flex w-full overflow-hidden rounded-xl" style={{ border: "1px solid var(--ph-line)" }} data-testid="cp-chips">
          {palette.map((c, i) => (
            <Chip key={i} color={c} label={t("chipLabel", { n: String(i + 1) })} />
          ))}
        </div>
      </div>

      <KitControls s={s} valueText={`${hue}°`} testId="cp-hue" />
      <p dir="auto" className="text-center text-xs font-semibold leading-5" style={{ color: "var(--ph-accent-strong)" }} data-testid="cp-readout">
        {t("readout", { hue: ltr(`${hue}°`), name: tN(hueName(hue)) })}
      </p>
    </div>
  );
}

/** Invalid state: the same wheel, grey (no colour to place), with the question it can't answer yet. */
export function PaletteWheelEmpty({ value }: { value: string }) {
  const t = useTranslations("tools.color-palette-generator.aboveFold.wheel");
  const W = 320;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2;
  return (
    <div className="mx-auto w-full max-w-[420px]" data-testid="cp-wheel-empty">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={t("emptyAria")}>
        <circle cx={cx} cy={cy} r={113} fill="none" style={{ stroke: "var(--glass-track)" }} strokeWidth={30} />
        <circle cx={cx} cy={cy} r={113} fill="none" style={{ stroke: "var(--glass-danger-strong)" }} strokeWidth={1.5} strokeDasharray="6 6" />
        <circle cx={cx} cy={cy} r={34} style={{ fill: "var(--ph-surface)", stroke: "var(--glass-danger-strong)" }} strokeWidth={1.5} />
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={30} fontWeight={900} style={{ fill: "var(--glass-danger-strong)" }}>
          ?
        </text>
        <text x={cx} y={cy - 48} textAnchor="middle" fontSize={12} fontWeight={800} style={{ fill: "var(--ph-ink)" }}>
          {t("emptyTitle")}
        </text>
        <text x={cx} y={cy + 58} textAnchor="middle" fontSize={11} fontWeight={700} direction="ltr" style={{ fill: "var(--ph-ink-muted)" }}>
          {value ? `“${value}”` : "—"}
        </text>
      </svg>
    </div>
  );
}
