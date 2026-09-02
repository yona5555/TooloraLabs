import type { CSSProperties, ReactNode } from "react";
import { caveat } from "./heroDoodleFont";

const STROKE = "fill-none stroke-purple-600 dark:stroke-purple-400";
const INK = "fill-purple-600 dark:fill-purple-400";

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
 * Purely decorative, original hand-drawn SVG doodles scattered across the full hero area — title,
 * calculator/search/categories row, and the stats row below it — reflecting the site's math,
 * finance, and science tool categories. Deliberately allowed to sit behind the white calculator,
 * search, category, and stats cards (at this same low opacity that's never a readability problem)
 * so coverage isn't limited to the outer edges. Every symbol is either custom path data or short
 * text set in a self-hosted handwriting webfont, not a traced or stock illustration.
 */
export default function HeroMathDoodles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.22] dark:opacity-[0.3]">
      {/* above the title */}
      <Doodle top="3%" left="3%" rotate={-8} size={40}>
        <Pi />
      </Doodle>
      <Doodle top="4%" right="4%" rotate={10} size={36}>
        <Sigma />
      </Doodle>

      {/* beside the title text */}
      <Doodle top="8%" left="12%" rotate={-3} fontSize={16}>
        <EquationText>x² + y² = z²</EquationText>
      </Doodle>
      <Doodle top="9%" right="12%" rotate={6} fontSize={22}>
        <EquationText>n²</EquationText>
      </Doodle>
      <Doodle top="11%" left="3%" rotate={9} fontSize={20}>
        <EquationText>⅓</EquationText>
      </Doodle>

      {/* the open band between the title and the calculator/search row — full width, no cards here */}
      <Doodle top="14%" left="9%" rotate={-5} fontSize={24}>
        <EquationText>%</EquationText>
      </Doodle>
      <Doodle top="14%" left="30%" rotate={-4} fontSize={15}>
        <EquationText>π ≈ 3.14</EquationText>
      </Doodle>
      <Doodle top="14%" left="49%" rotate={4} size={24}>
        <CheckMark />
      </Doodle>
      <Doodle top="14%" right="30%" rotate={5} fontSize={20}>
        <EquationText>10²</EquationText>
      </Doodle>
      <Doodle top="14%" right="9%" rotate={4} size={30}>
        <SquareShape />
      </Doodle>

      {/* the narrow open gutter between the calculator card and the search/category column */}
      <Doodle top="24%" left="45.7%" rotate={6} fontSize={16}>
        <EquationText>≈</EquationText>
      </Doodle>
      <Doodle top="37%" left="45.7%" rotate={-6} size={18}>
        <Diamond />
      </Doodle>
      <Doodle top="50%" left="45.7%" rotate={5} fontSize={16}>
        <EquationText>¾</EquationText>
      </Doodle>
      <Doodle top="62%" left="45.7%" rotate={-5} size={18}>
        <CircleShape />
      </Doodle>

      {/* the calculator card's left margin */}
      <Doodle top="28%" left="2.5%" rotate={-6} fontSize={22}>
        <EquationText>$</EquationText>
      </Doodle>
      <Doodle top="40%" left="2%" rotate={0} size={34}>
        <CircleShape />
      </Doodle>
      <Doodle top="52%" left="2.5%" rotate={5} fontSize={18}>
        <EquationText>log</EquationText>
      </Doodle>
      <Doodle top="64%" left="2.5%" rotate={5} fontSize={22}>
        <EquationText>€</EquationText>
      </Doodle>

      {/* the category grid's right margin */}
      <Doodle top="28%" right="2.5%" rotate={8} fontSize={20}>
        <EquationText>½</EquationText>
      </Doodle>
      <Doodle top="40%" right="1.5%" rotate={-4} size={32}>
        <Pentagon />
      </Doodle>
      <Doodle top="52%" right="2.5%" rotate={4} fontSize={20}>
        <EquationText>÷</EquationText>
      </Doodle>
      <Doodle top="64%" right="2%" rotate={-6} size={36}>
        <SquareRoot />
      </Doodle>

      {/* the open band between the category grid and the stats row */}
      <Doodle top="73%" left="10%" rotate={3} fontSize={16}>
        <EquationText>y = mx + b</EquationText>
      </Doodle>
      <Doodle top="73%" left="33%" rotate={-3} size={24}>
        <Triangle />
      </Doodle>
      <Doodle top="73%" right="33%" rotate={-8} size={26}>
        <InfinityShape />
      </Doodle>
      <Doodle top="73%" right="10%" rotate={-4} fontSize={17}>
        <EquationText>2a = 10</EquationText>
      </Doodle>

      {/* the open band below the stats cards, at the section's bottom edge */}
      <Doodle bottom="4%" left="15%" rotate={-4} fontSize={16}>
        <EquationText>x + y = z</EquationText>
      </Doodle>
      <Doodle bottom="4%" left="40%" rotate={5} size={20}>
        <CircleShape />
      </Doodle>
      <Doodle bottom="4%" right="40%" rotate={-5} size={20}>
        <SquareShape />
      </Doodle>
      <Doodle bottom="4%" right="15%" rotate={4} fontSize={18}>
        <EquationText>∆</EquationText>
      </Doodle>
    </div>
  );
}
