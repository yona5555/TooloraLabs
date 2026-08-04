export type GaugeZone = { from: number; to: number; color: string };

export type GaugeSpec = {
  zones: GaugeZone[];
  domainMin: number;
  domainMax: number;
  value: number;
  ticks: number[];
};

/**
 * Renders a segmented gauge (colored zone bar + value marker) onto a canvas,
 * generic enough for any tool with a "where does my result fall on a range"
 * visual — not BMI-specific. Drawn directly with Canvas 2D (not by
 * rasterizing the on-page SVG) so it doesn't depend on currentColor/Tailwind
 * classes that only resolve via the live stylesheet.
 */
export function drawGaugeCanvas(spec: GaugeSpec, widthCss = 640): HTMLCanvasElement {
  const heightCss = 130;
  const dpr = 2;

  const canvas = document.createElement("canvas");
  canvas.width = widthCss * dpr;
  canvas.height = heightCss * dpr;
  canvas.style.width = `${widthCss}px`;
  canvas.style.height = `${heightCss}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(dpr, dpr);

  const marginX = 20;
  const barY = 24;
  const barHeight = 28;
  const barWidth = widthCss - marginX * 2;

  const scaleX = (v: number) => {
    const clamped = Math.min(Math.max(v, spec.domainMin), spec.domainMax);
    return marginX + ((clamped - spec.domainMin) / (spec.domainMax - spec.domainMin)) * barWidth;
  };

  for (const zone of spec.zones) {
    const x = scaleX(zone.from);
    const w = scaleX(zone.to) - x;
    ctx.fillStyle = zone.color;
    ctx.fillRect(x, barY, w, barHeight);
  }

  ctx.strokeStyle = "#a1a1aa";
  ctx.fillStyle = "#52525b";
  ctx.font = "12px Arial, sans-serif";
  ctx.textAlign = "center";
  for (const tick of spec.ticks) {
    const x = scaleX(tick);
    ctx.beginPath();
    ctx.moveTo(x, barY + barHeight);
    ctx.lineTo(x, barY + barHeight + 6);
    ctx.stroke();
    ctx.fillText(String(tick), x, barY + barHeight + 20);
  }

  const markerX = scaleX(spec.value);
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.moveTo(markerX - 7, barY - 12);
  ctx.lineTo(markerX + 7, barY - 12);
  ctx.lineTo(markerX, barY - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#18181b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(markerX, barY - 2);
  ctx.lineTo(markerX, barY + barHeight);
  ctx.stroke();

  return canvas;
}
