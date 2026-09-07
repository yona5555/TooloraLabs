export type GaugeZone = { from: number; to: number; color: string };

export type GaugeSpec = {
  zones: GaugeZone[];
  domainMin: number;
  domainMax: number;
  value: number;
  ticks: number[];
  tickFormatter?: (tick: number) => string;
  /** Big centered readout above the needle, e.g. "7.87". Falls back to the raw value if omitted. */
  valueLabel?: string;
  /** Small classification line under the readout, e.g. "Sinks (SG > 1)". */
  caption?: string;
};

// Every proportion below is `<on-page RatioGauge's own SVG coordinate> * SCALE`,
// where SCALE = widthCss / 240 (240 being RatioGauge's own SIZE_W). RatioGauge's
// layout was itself tuned to fix a real overlap bug (its caption text used to sit
// ~5px below the arc with descenders clipped by the viewBox edge — see
// TooloraLabs-Claude-Instructions.md §19/§21) and confirmed overlap-free across
// 16 tools. Reusing those exact ratios here — just scaled up for a much larger,
// print-appropriate size — inherits that guarantee instead of re-deriving spacing
// from scratch.
const REFERENCE_WIDTH = 240;
const REFERENCE_CY = 128;
const REFERENCE_R = 92;
const REFERENCE_STROKE = 22;
const REFERENCE_HEIGHT = 176;

/**
 * Renders a semicircular arc gauge (colored zone arcs + needle + big value
 * readout + classification caption) onto a canvas — the same visual language
 * as the on-page RatioGauge, at a size generous enough to read clearly on a
 * printed A4 page. Drawn directly with Canvas 2D (not by rasterizing the
 * on-page SVG) so it doesn't depend on currentColor/Tailwind classes that
 * only resolve via the live stylesheet.
 */
export function drawGaugeCanvas(spec: GaugeSpec, widthCss = 680): HTMLCanvasElement {
  const scale = widthCss / REFERENCE_WIDTH;
  const CX = widthCss / 2;
  const CY = REFERENCE_CY * scale;
  const R = REFERENCE_R * scale;
  const STROKE = REFERENCE_STROKE * scale;
  const heightCss = REFERENCE_HEIGHT * scale;
  const dpr = 2;

  const canvas = document.createElement("canvas");
  canvas.width = widthCss * dpr;
  canvas.height = heightCss * dpr;
  canvas.style.width = `${widthCss}px`;
  canvas.style.height = `${heightCss}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(dpr, dpr);

  const span = spec.domainMax - spec.domainMin;
  // Canvas angle 0 = east/right, and increasing angle sweeps clockwise on
  // screen (canvas's y-axis points down) — so π (west/left) -> 1.5π (top) ->
  // 2π (east/right) traces exactly the left-to-right semicircle through the
  // top that a gauge needs, with no anticlockwise flag required.
  const angleFor = (v: number) => {
    const t = span > 0 ? (Math.min(Math.max(v, spec.domainMin), spec.domainMax) - spec.domainMin) / span : 0;
    return Math.PI + t * Math.PI;
  };

  ctx.lineCap = "butt";
  ctx.lineWidth = STROKE;
  ctx.strokeStyle = "#e4e4e7";
  ctx.beginPath();
  ctx.arc(CX, CY, R, Math.PI, 2 * Math.PI);
  ctx.stroke();

  for (const zone of spec.zones) {
    ctx.strokeStyle = zone.color;
    ctx.beginPath();
    ctx.arc(CX, CY, R, angleFor(zone.from), angleFor(zone.to));
    ctx.stroke();
  }

  const tickR = R + STROKE / 2 + 12 * scale;
  ctx.strokeStyle = "#a1a1aa";
  ctx.fillStyle = "#52525b";
  ctx.font = `${10 * scale}px Arial, sans-serif`;
  ctx.lineWidth = Math.max(1, 1.5 * scale);
  for (const tick of spec.ticks) {
    const angle = angleFor(tick);
    const x1 = CX + (R - STROKE / 2) * Math.cos(angle);
    const y1 = CY + (R - STROKE / 2) * Math.sin(angle);
    const x2 = CX + (R + STROKE / 2 + 6 * scale) * Math.cos(angle);
    const y2 = CY + (R + STROKE / 2 + 6 * scale) * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const t = span > 0 ? (Math.min(Math.max(tick, spec.domainMin), spec.domainMax) - spec.domainMin) / span : 0;
    // Mirrors RatioGauge's own anchor-clamping: a centered label at the very
    // end of the arc would otherwise run past the canvas edge.
    ctx.textAlign = t < 0.08 ? "left" : t > 0.92 ? "right" : "center";
    ctx.fillText(spec.tickFormatter ? spec.tickFormatter(tick) : String(tick), CX + tickR * Math.cos(angle), CY + tickR * Math.sin(angle) + 4 * scale);
  }

  const needleAngle = angleFor(spec.value);
  const needleInnerR = R - STROKE / 2 - 6 * scale;
  const needleOuterR = R + STROKE / 2 + 10 * scale;
  ctx.strokeStyle = "#18181b";
  ctx.lineWidth = Math.max(2, 3 * scale);
  ctx.beginPath();
  ctx.moveTo(CX + needleInnerR * Math.cos(needleAngle), CY + needleInnerR * Math.sin(needleAngle));
  ctx.lineTo(CX + needleOuterR * Math.cos(needleAngle), CY + needleOuterR * Math.sin(needleAngle));
  ctx.stroke();
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.arc(CX + needleOuterR * Math.cos(needleAngle), CY + needleOuterR * Math.sin(needleAngle), Math.max(3, 4 * scale), 0, 2 * Math.PI);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#18181b";
  ctx.font = `bold ${22 * scale}px Arial, sans-serif`;
  ctx.fillText(spec.valueLabel ?? String(spec.value), CX, CY - 6 * scale);

  if (spec.caption) {
    ctx.fillStyle = "#52525b";
    ctx.font = `600 ${12 * scale}px Arial, sans-serif`;
    ctx.fillText(spec.caption, CX, CY + 26 * scale);
  }

  return canvas;
}
