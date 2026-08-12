export type Dimensions = { width: number; height: number };

/**
 * Fits an image within maxWidth/maxHeight while preserving aspect ratio.
 * Never upscales — an image already smaller than the bounds is returned
 * unchanged, since stretching a small image up only degrades it further.
 */
export function computeResizedDimensions(
  original: Dimensions,
  maxWidth: number | null,
  maxHeight: number | null
): Dimensions {
  if (!maxWidth && !maxHeight) return original;

  const widthScale = maxWidth ? maxWidth / original.width : Infinity;
  const heightScale = maxHeight ? maxHeight / original.height : Infinity;
  const scale = Math.min(widthScale, heightScale, 1);

  return {
    width: Math.max(1, Math.round(original.width * scale)),
    height: Math.max(1, Math.round(original.height * scale)),
  };
}

export function computeCompressionPercent(originalBytes: number, newBytes: number): number {
  if (originalBytes <= 0) return 0;
  return Math.round((1 - newBytes / originalBytes) * 100);
}
