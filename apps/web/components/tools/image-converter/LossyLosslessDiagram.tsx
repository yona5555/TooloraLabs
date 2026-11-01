"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useId } from "react";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useSvgUnitsPerPx } from "@/components/tool-ui/useFitWidth";
type LossyLosslessDiagramProps = {
  losslessLabel: string;
  lossyLabel: string;
  originalLabel: string;
  compressedLabel: string;
  resultLabel: string;
  identicalLabel: string;
  approximateLabel: string;
  caption: string;
};

const WIDTH = 480;
const BOX_W = 88;
const BOX_H = 40;

function Row({
  y,
  rowLabel,
  originalLabel,
  compressedLabel,
  resultLabel,
  noteLabel,
  compressedOpacity,
  resultOpacity,
  arrowId,
  fs,
}: {
  fs: number;
  arrowId: string;
  y: number;
  rowLabel: string;
  originalLabel: string;
  compressedLabel: string;
  resultLabel: string;
  noteLabel: string;
  compressedOpacity: number;
  resultOpacity: number;
}) {
  const boxY = y + 20;
  const xs = [10, 196, 382];
  // label lines spaced by the rendered label size (fs, chart units): a phone draws this 480-unit
  // diagram at ~300px, and fixed gaps let the 12px lines run into each other (§39)
  const labelY = boxY + BOX_H + 4 + fs;

  return (
    <g>
      <text style={{ fontSize: svgPx(12) }} x={0} y={y + 2} fontWeight={700} fill="currentColor">
        {rowLabel}
      </text>

      <rect x={xs[0]} y={boxY} width={BOX_W} height={BOX_H} rx={6} fill="none" stroke="currentColor" strokeWidth={1.5} />
      <text style={{ fontSize: svgPx(12) }} x={xs[0] + BOX_W / 2} y={labelY} textAnchor="middle" fill="currentColor">
        {originalLabel}
      </text>

      <path
        d={`M ${xs[0] + BOX_W + 6} ${boxY + BOX_H / 2} L ${xs[1] - 6} ${boxY + BOX_H / 2}`}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.5}
        markerEnd={`url(#${arrowId})`}
      />

      <rect x={xs[1]} y={boxY} width={BOX_W} height={BOX_H} rx={6} fill="currentColor" opacity={compressedOpacity} stroke="currentColor" strokeWidth={1} />
      <text style={{ fontSize: svgPx(12) }} x={xs[1] + BOX_W / 2} y={labelY} textAnchor="middle" fill="currentColor">
        {compressedLabel}
      </text>

      <path
        d={`M ${xs[1] + BOX_W + 6} ${boxY + BOX_H / 2} L ${xs[2] - 6} ${boxY + BOX_H / 2}`}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.5}
        markerEnd={`url(#${arrowId})`}
      />

      <rect x={xs[2]} y={boxY} width={BOX_W} height={BOX_H} rx={6} fill="currentColor" opacity={resultOpacity} stroke="currentColor" strokeWidth={1} />
      <text style={{ fontSize: svgPx(12) }} x={xs[2] + BOX_W / 2} y={labelY} textAnchor="middle" fill="currentColor">
        {resultLabel}
      </text>

      <text style={{ fontSize: svgPx(12) }} x={WIDTH - 2} y={labelY + fs * 1.3} textAnchor="end" fill="currentColor" opacity={0.7}>
        {noteLabel}
      </text>
    </g>
  );
}

export default function LossyLosslessDiagram({
  losslessLabel,
  lossyLabel,
  originalLabel,
  compressedLabel,
  resultLabel,
  identicalLabel,
  approximateLabel,
  caption,
}: LossyLosslessDiagramProps) {
  const svgId = useId();
  const [svgRef, k] = useSvgUnitsPerPx(WIDTH);
  const fs = 12 * k;
  // row: title, boxes (20 below it), two caption lines, then the gap to the next row
  const ROW_H = 20 + BOX_H + 4 + fs * 2.3 + 18;
  const HEIGHT = 14 + ROW_H + 20 + BOX_H + 4 + fs * 2.3 + 6;
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <FitSvg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full min-w-[420px] text-current max-md:min-w-0">
          <defs>
            <marker id={`${svgId}arrow`} markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity={0.6} />
            </marker>
          </defs>
          <Row arrowId={`${svgId}arrow`} fs={fs}
            y={14}
            rowLabel={losslessLabel}
            originalLabel={originalLabel}
            compressedLabel={compressedLabel}
            resultLabel={resultLabel}
            noteLabel={identicalLabel}
            compressedOpacity={0.15}
            resultOpacity={0.15}
          />
          <Row arrowId={`${svgId}arrow`} fs={fs}
            y={14 + ROW_H}
            rowLabel={lossyLabel}
            originalLabel={originalLabel}
            compressedLabel={compressedLabel}
            resultLabel={resultLabel}
            noteLabel={approximateLabel}
            compressedOpacity={0.55}
            resultOpacity={0.35}
          />
        </FitSvg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
