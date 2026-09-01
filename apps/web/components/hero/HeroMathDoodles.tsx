import { caveat } from "./heroDoodleFont";

const STROKE = "fill-none stroke-purple-600 dark:stroke-purple-400";

/** Hand-drawn (not typeset) — each path is deliberately a little uneven, the way a symbol sketched in the margin of a notebook would be, rather than a precise geometric glyph. */
function Pi({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} className={STROKE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4,10 Q6,5 13,6 L38,7 Q45,7 46,11 M15,6 L11,42 Q10,47 15,45 M35,7 L38,39 Q39,45 43,41" />
    </g>
  );
}

function Sigma({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} className={STROKE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6,5 L33,4 L10,25 L34,45 L6,47" />
    </g>
  );
}

function SquareRoot({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} className={STROKE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M0,16 L5,13 L11,26 L20,2 L49,2" />
    </g>
  );
}

function Circle({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} className={STROKE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20,2 C30,2 38,10 38,20 C38,30 30,38 20,38 C10,38 2,30 2,20 C2,11 9,3 18,2" />
    </g>
  );
}

function Triangle({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} className={STROKE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19,2 Q25,19 35,36 Q18,32 3,37 Q9,17 19,2 Z" />
    </g>
  );
}

function Infinity({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} className={STROKE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5,13 C5,7 11,7 13,13 C15,19 21,19 23,13 C21,7 15,7 13,13 C11,19 5,19 5,13 Z" />
    </g>
  );
}

function HandText({ x, y, scale = 1, rotate = 0, children }: { x: number; y: number; scale?: number; rotate?: number; children: string }) {
  return (
    <text
      x={x}
      y={y}
      transform={`rotate(${rotate} ${x} ${y})`}
      fontSize={38 * scale}
      className={`${caveat.className} fill-purple-600 dark:fill-purple-400`}
    >
      {children}
    </text>
  );
}

/**
 * Purely decorative, original hand-drawn SVG doodles scattered around the edges of the hero's
 * title/calculator/category area — deliberately kept out of the horizontal and vertical center so
 * nothing ever sits behind the title, search field, or any interactive control. Every symbol here
 * is custom path data (the Greek letters, radical, and infinity) or short text set in a self-hosted
 * handwriting webfont (the algebra snippets and %), not a traced or stock illustration. Opacity is
 * kept low enough that this reads as paper texture, not content.
 *
 * Split into two independent top/bottom bands (each locked to its own `aspect-[35/8]` box) rather
 * than one tall centered scene: the hero's wrapper aspect ratio swings from very tall (mobile,
 * stacked columns) to wide (desktop), and a single viewBox scaled with "meet" would letterbox by
 * shrinking + centering the WHOLE scene, collapsing every doodle into one thin band in the middle
 * of a tall mobile layout instead of staying near the top/bottom edges. Anchoring each band to its
 * own edge with a fixed aspect ratio keeps doodles pinned to the top and bottom at any viewport
 * size, with no cropping and no distortion (the band's rendered height always tracks its width).
 */
export default function HeroMathDoodles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.05] dark:opacity-[0.08]">
      <svg viewBox="0 0 1400 320" preserveAspectRatio="xMidYMid meet" className="absolute top-0 left-0 aspect-[35/8] w-full">
        <Pi x={35} y={30} scale={1.05} rotate={-6} />
        <Sigma x={1310} y={70} scale={1} rotate={8} />
        <SquareRoot x={30} y={270} scale={1.1} rotate={-4} />
        <Circle x={1330} y={290} scale={1} rotate={0} />
        <HandText x={1180} y={75} scale={0.55} rotate={-5}>
          n²
        </HandText>
        <HandText x={1270} y={160} scale={0.5} rotate={10}>
          ½
        </HandText>
        <HandText x={70} y={185} scale={0.5} rotate={-9}>
          +
        </HandText>
      </svg>

      <svg viewBox="0 0 1400 320" preserveAspectRatio="xMidYMid meet" className="absolute bottom-0 left-0 aspect-[35/8] w-full">
        <Triangle x={55} y={150} scale={1} rotate={5} />
        <Infinity x={1305} y={170} scale={1.5} rotate={-8} />

        <HandText x={35} y={275} rotate={-4}>
          %
        </HandText>
        <HandText x={150} y={285} scale={0.5} rotate={3}>
          x + y = z
        </HandText>
        <HandText x={1160} y={290} scale={0.5} rotate={4}>
          2a = 10
        </HandText>
      </svg>
    </div>
  );
}
