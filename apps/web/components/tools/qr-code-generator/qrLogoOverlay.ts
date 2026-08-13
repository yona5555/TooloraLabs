/**
 * Embeds a logo image directly into a QR code SVG string, centered and
 * backed by a small white square for contrast. Kept to roughly 22% of the
 * QR's width — comfortably under the ~30% damage tolerance of error
 * correction level H, which the caller is expected to force whenever this
 * is used, so the code stays scannable despite the covered center.
 */
export function embedCenterLogo(svg: string, logoDataUrl: string): string {
  const widthMatch = svg.match(/width="(\d+(?:\.\d+)?)"/);
  const heightMatch = svg.match(/height="(\d+(?:\.\d+)?)"/);
  const viewBoxMatch = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);

  const width = viewBoxMatch ? Number(viewBoxMatch[1]) : widthMatch ? Number(widthMatch[1]) : 256;
  const height = viewBoxMatch ? Number(viewBoxMatch[2]) : heightMatch ? Number(heightMatch[1]) : 256;

  const logoSize = Math.round(Math.min(width, height) * 0.22);
  const padding = Math.round(logoSize * 0.12);
  const boxSize = logoSize + padding * 2;
  const x = (width - boxSize) / 2;
  const y = (height - boxSize) / 2;
  const imgX = (width - logoSize) / 2;
  const imgY = (height - logoSize) / 2;

  const overlay = `<rect x="${x}" y="${y}" width="${boxSize}" height="${boxSize}" fill="#ffffff" /><image href="${logoDataUrl}" x="${imgX}" y="${imgY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" />`;

  return svg.replace("</svg>", `${overlay}</svg>`);
}
