"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Moon, Sun } from "lucide-react";
import type { CalculatorMode } from "./HomeCalculator";

const MODES: CalculatorMode[] = ["standard", "scientific", "graph", "programmer", "converter"];

type CalculatorTopBarProps = {
  mode: CalculatorMode;
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
    <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2.5 calcdark:border-zinc-800 calcdark:bg-zinc-900">
      <div className="relative shrink-0" ref={menuRef}>
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

      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:text-sm ${
              mode === m
                ? "bg-blue-50 text-blue-600 calcdark:bg-blue-500/10 calcdark:text-blue-400"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 calcdark:text-zinc-400 calcdark:hover:bg-zinc-800"
            }`}
          >
            {tHome(`modes.${m}`)}
          </button>
        ))}
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
