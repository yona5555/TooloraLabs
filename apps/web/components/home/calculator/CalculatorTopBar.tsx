"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, Binary, Calculator, ChartLine, FlaskConical, Menu, Moon, Sun, type LucideIcon } from "lucide-react";
import type { CalculatorMode } from "./HomeCalculator";

const MODES: CalculatorMode[] = ["standard", "scientific", "graph", "programmer", "converter"];

/** Phone tab icons (below md): icon plus short label, icons only when a label does not fit. */
const MODE_ICONS: Record<CalculatorMode, LucideIcon> = {
  standard: Calculator,
  scientific: FlaskConical,
  graph: ChartLine,
  programmer: Binary,
  converter: ArrowLeftRight,
};

// Phone tabs are buttons (border + fill on every state); md and up keep the original flat tabs.
const TAB_ACTIVE = "bg-blue-50 text-blue-600 calcdark:bg-blue-500/10 calcdark:text-blue-400 max-md:border-blue-300 max-md:calcdark:border-blue-500/40";
const TAB_INACTIVE = "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 calcdark:text-zinc-400 calcdark:hover:bg-zinc-800 max-md:border-zinc-200 max-md:bg-white max-md:calcdark:border-zinc-700 max-md:calcdark:bg-zinc-900";

function tabStateClasses(mode: CalculatorMode | null, tab: CalculatorMode): string {
  if (mode === null && tab === "scientific") {
    return "max-md:border-blue-300 max-md:bg-blue-50 max-md:text-blue-600 max-md:calcdark:border-blue-500/40 max-md:calcdark:bg-blue-500/10 max-md:calcdark:text-blue-400 md:text-zinc-500 md:hover:bg-zinc-100 md:hover:text-zinc-700 md:calcdark:text-zinc-400 md:calcdark:hover:bg-zinc-800";
  }
  if (mode === null && tab === "graph") {
    return "md:bg-blue-50 md:text-blue-600 md:calcdark:bg-blue-500/10 md:calcdark:text-blue-400 max-md:border-zinc-200 max-md:bg-white max-md:text-zinc-500 max-md:hover:bg-zinc-100 max-md:hover:text-zinc-700 max-md:calcdark:border-zinc-700 max-md:calcdark:bg-zinc-900 max-md:calcdark:text-zinc-400 max-md:calcdark:hover:bg-zinc-800";
  }
  return mode === tab ? TAB_ACTIVE : TAB_INACTIVE;
}

type CalculatorTopBarProps = {
  /** null before mount: the default tab is then picked by CSS (Scientific on phones, Graph from md up). */
  mode: CalculatorMode | null;
  setMode: (mode: CalculatorMode) => void;
  calcDark: boolean;
  onToggleCalcDark: () => void;
};

/**
 * Deliberately NOT the site-wide ThemeToggle: this button controls only the
 * calculator card's own `calcdark:`-scoped appearance (see the calcdark
 * custom variant in globals.css), independent of the site-wide `.dark`
 * class on <html>. The one site-wide toggle stays in the main Navbar only.
 */
export default function CalculatorTopBar({ mode, setMode, calcDark, onToggleCalcDark }: CalculatorTopBarProps) {
  const tHome = useTranslations("homeCalculator");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  // Phone: icons only when any short label would be cut at the current width (locale and font dependent).
  const [iconsOnly, setIconsOnly] = useState(false);
  useLayoutEffect(() => {
    const row = tabsRef.current;
    if (!row) return;
    const check = () => {
      const labels = [...row.querySelectorAll<HTMLElement>("[data-tab-short]")];
      setIconsOnly(labels.some((l) => l.scrollWidth > l.clientWidth + 0.5));
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(row);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  function selectMode(next: CalculatorMode) {
    setMode(next);
    setMenuOpen(false);
  }

  return (
    <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2.5 calcdark:border-zinc-800 calcdark:bg-zinc-900 max-md:rounded-xl max-md:border max-md:border-zinc-200/70 max-md:px-2 max-md:py-1.5 max-md:calcdark:border-zinc-800">
      {/* Phone: all five tabs fit in one row, so the mode menu is desktop only. */}
      <div className="relative shrink-0 max-md:hidden" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={tHome("modes.menuLabel")}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 calcdark:text-zinc-300 calcdark:hover:bg-zinc-800"
        >
          <Menu size={18} />
        </button>
        {menuOpen && (
          <div className="absolute top-full z-20 mt-1 w-40 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg ltr:left-0 rtl:right-0 calcdark:border-zinc-700 calcdark:bg-zinc-900">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => selectMode(m)}
                className={`block w-full px-3 py-2 text-start text-sm transition ${
                  mode === m
                    ? "font-semibold text-blue-600 calcdark:text-blue-400"
                    : "text-zinc-600 hover:bg-zinc-50 calcdark:text-zinc-300 calcdark:hover:bg-zinc-800"
                }`}
              >
                {tHome(`modes.${m}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={tabsRef} className="flex min-w-0 flex-1 gap-1 md:overflow-x-auto">
        {MODES.map((m) => {
          const Icon = MODE_ICONS[m];
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-label={iconsOnly ? tHome(`modes.${m}`) : undefined}
              title={iconsOnly ? tHome(`modes.${m}`) : undefined}
              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:text-sm max-md:flex max-md:min-h-11 max-md:min-w-0 max-md:flex-1 max-md:basis-0 max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-0.5 max-md:border max-md:px-0.5 max-md:py-1 ${tabStateClasses(mode, m)}`}
            >
              <Icon size={16} aria-hidden="true" className="shrink-0 md:hidden" />
              <span data-tab-short="" className={`block w-full overflow-hidden text-center text-[10px] leading-3 whitespace-nowrap md:hidden ${iconsOnly ? "invisible h-0" : ""}`}>
                {tHome(`modesShort.${m}`)}
              </span>
              <span className="max-md:hidden">{tHome(`modes.${m}`)}</span>
            </button>
          );
        })}
      </div>

      <div className="shrink-0">
        <button
          type="button"
          onClick={onToggleCalcDark}
          aria-label={tHome("buttons.toggleCalculatorTheme")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 calcdark:text-zinc-300 calcdark:hover:bg-zinc-800"
        >
          {calcDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}
