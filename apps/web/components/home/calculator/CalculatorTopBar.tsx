"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import type { CalculatorMode } from "./HomeCalculator";

const MODES: CalculatorMode[] = ["standard", "scientific", "graph", "programmer", "converter"];

type CalculatorTopBarProps = {
  mode: CalculatorMode;
  setMode: (mode: CalculatorMode) => void;
};

export default function CalculatorTopBar({ mode, setMode }: CalculatorTopBarProps) {
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
    <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={tHome("modes.menuLabel")}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Menu size={18} />
        </button>
        {menuOpen && (
          <div className="absolute top-full z-20 mt-1 w-40 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg ltr:left-0 rtl:right-0 dark:border-zinc-700 dark:bg-zinc-900">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => selectMode(m)}
                className={`block w-full px-3 py-2 text-start text-sm transition ${
                  mode === m
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {tHome(`modes.${m}`)}
          </button>
        ))}
      </div>

      <div className="shrink-0">
        <ThemeToggle />
      </div>
    </div>
  );
}
