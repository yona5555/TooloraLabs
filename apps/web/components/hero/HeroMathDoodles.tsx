import type { CSSProperties, ReactNode } from "react";
import { caveat } from "./heroDoodleFont";

const STROKE = "fill-none stroke-purple-600 dark:stroke-purple-400";
const INK = "fill-purple-600 dark:fill-purple-400";
/** Thinner, undashed-by-default stroke for the labeled geometry diagrams — a technical-drawing feel distinct from the looser hand-sketched symbols and equations elsewhere on this canvas. */
const PRECISE_STROKE = "fill-none stroke-purple-600 dark:stroke-purple-400";

/** Hand-drawn (not typeset) — each path is deliberately a little uneven, the way a symbol sketched in the margin of a notebook would be, rather than a precise geometric glyph. Each icon keeps its own small viewBox matching its natural proportions, so rendering it at a fixed pixel size never stretches or distorts it. */
function Pi() {
  return (
    <svg viewBox="0 0 50 50" className={STROKE} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4,10 Q6,5 13,6 L38,7 Q45,7 46,11 M15,6 L11,42 Q10,47 15,45 M35,7 L38,39 Q39,45 43,41" />
    </svg>
  );
}

function Sigma() {
  return (
    <svg viewBox="0 0 40 50" className={STROKE} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6,5 L33,4 L10,25 L34,45 L6,47" />
    </svg>
  );
}

function SquareRoot() {
  return (
    <svg viewBox="0 0 50 30" className={STROKE} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M0,16 L5,13 L11,26 L20,2 L49,2" />
    </svg>
  );
}

function CircleShape() {
  return (
    <svg viewBox="0 0 40 40" className={STROKE} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20,2 C30,2 38,10 38,20 C38,30 30,38 20,38 C10,38 2,30 2,20 C2,11 9,3 18,2" />
    </svg>
  );
}

function Triangle() {
  return (
    <svg viewBox="0 0 40 40" className={STROKE} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19,2 Q25,19 35,36 Q18,32 3,37 Q9,17 19,2 Z" />
    </svg>
  );
}

function InfinityShape() {
  return (
    <svg viewBox="0 0 28 26" className={STROKE} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5,13 C5,7 11,7 13,13 C15,19 21,19 23,13 C21,7 15,7 13,13 C11,19 5,19 5,13 Z" />
    </svg>
  );
}

function SquareShape() {
  return (
    <svg viewBox="0 0 40 40" className={STROKE} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4,5 L35,3 L37,35 L3,37 Z" />
    </svg>
  );
}

function Pentagon() {
  return (
    <svg viewBox="0 0 40 40" className={STROKE} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20,2 L38,16 L31,37 L9,37 L2,16 Z" />
    </svg>
  );
}

function Diamond() {
  return (
    <svg viewBox="0 0 34 40" className={STROKE} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17,2 L32,20 L17,38 L2,20 Z" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 34 26" className={STROKE} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2,13 L13,23 L32,3" />
    </svg>
  );
}

/** A circle with its radius drawn in and labeled "r" — like a textbook geometry-formula figure rather than a loose sketch, so it reads as a real diagram, not just decoration. */
function LabeledCircle() {
  return (
    <svg viewBox="0 0 60 60" className={PRECISE_STROKE} strokeWidth={1.6} strokeLinecap="round">
      <circle cx="30" cy="32" r="22" />
      <line x1="30" y1="32" x2="30" y2="10" strokeDasharray="3 2" />
      <circle cx="30" cy="32" r="1.4" className={INK} stroke="none" />
      <text x="33" y="22" fontSize="11" fontStyle="italic" className={INK}>
        r
      </text>
    </svg>
  );
}

/** A rectangle with its length and width dimension lines labeled "l" and "w" — the classic area-formula figure. */
function LabeledRectangle() {
  return (
    <svg viewBox="0 0 70 54" className={PRECISE_STROKE} strokeWidth={1.6} strokeLinecap="round">
      <rect x="6" y="10" width="50" height="30" />
      <line x1="6" y1="46" x2="56" y2="46" strokeDasharray="3 2" />
      <line x1="62" y1="10" x2="62" y2="40" strokeDasharray="3 2" />
      <text x="27" y="53" fontSize="11" fontStyle="italic" className={INK}>
        l
      </text>
      <text x="65" y="28" fontSize="11" fontStyle="italic" className={INK}>
        w
      </text>
    </svg>
  );
}

/** An isometric cube outline with one edge labeled "a" — volume-formula figure (V = a³). */
function LabeledCube() {
  return (
    <svg viewBox="0 0 60 60" className={PRECISE_STROKE} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10,26 L10,50 L34,50 L34,26 Z" />
      <path d="M10,26 L20,16 L44,16 L34,26 Z" />
      <path d="M34,26 L44,16 L44,40 L34,50 Z" />
      <text x="18" y="58" fontSize="11" fontStyle="italic" className={INK}>
        a
      </text>
    </svg>
  );
}

/** A cone in profile — apex, slant sides, and a base ellipse (its hidden back half dashed) — with height "h" and base radius "r" labeled, the classic V = ⅓πr²h figure. */
function LabeledCone() {
  return (
    <svg viewBox="0 0 60 60" className={PRECISE_STROKE} strokeWidth={1.6} strokeLinecap="round">
      <path d="M12,48 L30,6 L48,48" />
      <path d="M12,48 A18,6 0 0 0 48,48" />
      <path d="M12,48 A18,6 0 0 1 48,48" strokeDasharray="3 2" />
      <line x1="30" y1="6" x2="30" y2="48" strokeDasharray="3 2" />
      <line x1="30" y1="48" x2="48" y2="48" />
      <text x="33" y="28" fontSize="11" fontStyle="italic" className={INK}>
        h
      </text>
      <text x="36" y="46" fontSize="11" fontStyle="italic" className={INK}>
        r
      </text>
    </svg>
  );
}

/**
 * One decorative element pinned near a fixed spot in the hero via CSS percentage offsets rather
 * than shared SVG coordinates. Percentages recompute correctly at every breakpoint on their own, so
 * each doodle stays anchored to the same relative spot whether the hero wrapper is short and wide
 * (desktop) or very tall and narrow (mobile, stacked columns) — the class of bug that a single
 * scaled/centered viewBox ran into (see git history). Icons render at a fixed pixel size with their
 * own matching viewBox, so they're never stretched; text uses a fixed font size for the same reason.
 */
function Doodle({
  top,
  bottom,
  left,
  right,
  rotate = 0,
  size,
  fontSize,
  children,
}: {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate?: number;
  size?: number;
  fontSize?: number;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    top,
    bottom,
    left,
    right,
    width: size,
    height: size,
    fontSize,
    transform: `rotate(${rotate}deg)`,
  };
  return (
    <div className="absolute" style={style}>
      {children}
    </div>
  );
}

function EquationText({ children }: { children: ReactNode }) {
  return <span className={`${caveat.className} ${INK} block leading-none whitespace-nowrap`}>{children}</span>;
}

/**
 * Purely decorative, original hand-drawn SVG doodles scattered densely across the full hero area —
 * the title/calculator/search row and the category grid below it — reflecting the site's math,
 * finance, and science tool categories. A handful (LabeledCircle/Rectangle/Cube/Cone) are drawn as
 * precise, thin-lined technical figures with their formula variables labeled (r, l, w, a, h) rather
 * than loose sketches, echoing the clean reference diagrams on sites like calculator.net without
 * tracing them. Everything else stays hand-drawn: custom path data or short text set in a
 * self-hosted handwriting webfont. Deliberately allowed to sit behind the white calculator, search,
 * and category cards (at this same low opacity, which is never a readability problem) so coverage
 * reaches the whole canvas instead of just the outer edges.
 */
export default function HeroMathDoodles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.22] dark:opacity-[0.3]">
      {/* top edge, above and beside the title */}
      <Doodle top="2%" left="3%" rotate={-8} size={40}>
        <Pi />
      </Doodle>
      <Doodle top="3%" right="4%" rotate={10} size={36}>
        <Sigma />
      </Doodle>
      <Doodle top="7%" left="12%" rotate={-3} fontSize={16}>
        <EquationText>x² + y² = z²</EquationText>
      </Doodle>
      <Doodle top="8%" right="12%" rotate={6} fontSize={22}>
        <EquationText>n²</EquationText>
      </Doodle>
      <Doodle top="10%" left="3%" rotate={9} fontSize={20}>
        <EquationText>⅓</EquationText>
      </Doodle>
      <Doodle top="10%" right="24%" rotate={-4} size={40}>
        <LabeledCircle />
      </Doodle>
      <Doodle top="9%" left="24%" rotate={5} size={44}>
        <LabeledCone />
      </Doodle>

      {/* the open band between the title and the calculator/search row */}
      <Doodle top="13%" left="9%" rotate={-5} fontSize={24}>
        <EquationText>%</EquationText>
      </Doodle>
      <Doodle top="13%" left="30%" rotate={-4} fontSize={15}>
        <EquationText>π ≈ 3.14</EquationText>
      </Doodle>
      <Doodle top="13%" left="49%" rotate={4} size={24}>
        <CheckMark />
      </Doodle>
      <Doodle top="13%" right="30%" rotate={5} fontSize={20}>
        <EquationText>10²</EquationText>
      </Doodle>
      <Doodle top="13%" right="9%" rotate={4} size={30}>
        <SquareShape />
      </Doodle>
      <Doodle top="17%" left="40%" rotate={5} fontSize={15}>
        <EquationText>a² + b² = c²</EquationText>
      </Doodle>
      <Doodle top="17%" right="42%" rotate={-6} fontSize={16}>
        <EquationText>F = ma</EquationText>
      </Doodle>

      {/* the calculator card's left margin */}
      <Doodle top="24%" left="2.5%" rotate={-6} fontSize={22}>
        <EquationText>$</EquationText>
      </Doodle>
      <Doodle top="33%" left="2%" rotate={0} size={34}>
        <CircleShape />
      </Doodle>
      <Doodle top="42%" left="2.5%" rotate={5} fontSize={18}>
        <EquationText>log</EquationText>
      </Doodle>
      <Doodle top="51%" left="2.5%" rotate={5} fontSize={22}>
        <EquationText>€</EquationText>
      </Doodle>
      <Doodle top="60%" left="2%" rotate={-4} size={36}>
        <LabeledCube />
      </Doodle>
      <Doodle top="70%" left="2.5%" rotate={4} fontSize={16}>
        <EquationText>E = mc²</EquationText>
      </Doodle>

      {/* the narrow open gutter between the calculator card and the search/category column */}
      <Doodle top="21%" left="45.7%" rotate={6} fontSize={16}>
        <EquationText>≈</EquationText>
      </Doodle>
      <Doodle top="30%" left="45.7%" rotate={-6} size={18}>
        <Diamond />
      </Doodle>
      <Doodle top="39%" left="45.7%" rotate={5} fontSize={16}>
        <EquationText>¾</EquationText>
      </Doodle>
      <Doodle top="48%" left="45.7%" rotate={-5} size={18}>
        <CircleShape />
      </Doodle>
      <Doodle top="57%" left="45.7%" rotate={4} fontSize={15}>
        <EquationText>2πr</EquationText>
      </Doodle>
      <Doodle top="66%" left="45.7%" rotate={-4} size={18}>
        <Triangle />
      </Doodle>

      {/* the category grid's right margin */}
      <Doodle top="24%" right="2.5%" rotate={8} fontSize={20}>
        <EquationText>½</EquationText>
      </Doodle>
      <Doodle top="33%" right="1.5%" rotate={-4} size={32}>
        <Pentagon />
      </Doodle>
      <Doodle top="42%" right="2.5%" rotate={4} fontSize={20}>
        <EquationText>÷</EquationText>
      </Doodle>
      <Doodle top="51%" right="2%" rotate={-6} size={36}>
        <SquareRoot />
      </Doodle>
      <Doodle top="60%" right="2.5%" rotate={5} size={38}>
        <LabeledRectangle />
      </Doodle>
      <Doodle top="71%" right="2.5%" rotate={-4} fontSize={16}>
        <EquationText>V = πr²h</EquationText>
      </Doodle>

      {/* scattered through the category grid itself — allowed to sit behind the cards */}
      <Doodle top="34%" left="18%" rotate={4} fontSize={15}>
        <EquationText>x + y = z</EquationText>
      </Doodle>
      <Doodle top="34%" right="18%" rotate={-4} fontSize={17}>
        <EquationText>2a = 10</EquationText>
      </Doodle>
      <Doodle top="46%" left="22%" rotate={-5} size={20}>
        <InfinityShape />
      </Doodle>
      <Doodle top="46%" right="22%" rotate={5} fontSize={16}>
        <EquationText>y = mx + b</EquationText>
      </Doodle>
      <Doodle top="58%" left="16%" rotate={5} fontSize={15}>
        <EquationText>∆</EquationText>
      </Doodle>
      <Doodle top="58%" right="16%" rotate={-5} size={18}>
        <SquareShape />
      </Doodle>

      {/* the open band below the category grid, at the section's bottom edge */}
      <Doodle bottom="3%" left="15%" rotate={-4} fontSize={16}>
        <EquationText>x² + 2x + 1</EquationText>
      </Doodle>
      <Doodle bottom="3%" left="40%" rotate={5} size={20}>
        <CircleShape />
      </Doodle>
      <Doodle bottom="3%" right="40%" rotate={-5} fontSize={15}>
        <EquationText>sin θ</EquationText>
      </Doodle>
      <Doodle bottom="3%" right="15%" rotate={4} fontSize={18}>
        <EquationText>%</EquationText>
      </Doodle>
    </div>
  );
}
