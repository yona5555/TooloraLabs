/**
 * Classic "nice numbers" axis-tick algorithm: picks a round step (1/2/5 × a power of ten)
 * instead of dividing the max by a fixed tick count, so labels read as $10K/$20K/$30K rather
 * than arbitrary values like $9,659/$19,318. Also pads the raw max by 10% before rounding up
 * to the next step, so the axis ceiling sits above the tallest bar instead of touching it.
 */
export function computeNiceTicks(rawMax: number, targetTickCount = 5): number[] {
  if (!Number.isFinite(rawMax) || rawMax <= 0) return [0];

  const paddedMax = rawMax * 1.1;
  const roughStep = paddedMax / Math.max(targetTickCount - 1, 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  const step = niceResidual * magnitude;
  const niceMax = Math.ceil(paddedMax / step) * step;

  const ticks: number[] = [];
  for (let value = 0; value <= niceMax + step / 2; value += step) {
    ticks.push(value);
  }
  return ticks;
}
