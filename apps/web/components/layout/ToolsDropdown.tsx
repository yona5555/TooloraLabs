"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";

export default function ToolsDropdown() {
  const t = useTranslations("navbar");
  const tc = useTranslations("categories");
  const tTools = useTranslations("tools");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
      >
        {t("browse")}
        <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute start-0 top-full z-20 mt-3 w-[min(90vw,42rem)] overflow-hidden rounded-2xl border border-blue-400/50 bg-zinc-900/85 shadow-2xl backdrop-blur-xl dark:bg-zinc-800/80"
        >
          <div className="max-h-[70vh] overflow-y-auto p-6">
            <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
              {categories.map((category) => {
                const categoryTools = tools.filter(
                  (tool) => tool.category === category.slug
                );
                if (categoryTools.length === 0) return null;

                return (
                  <div key={category.slug} className="mb-6 break-inside-avoid">
                    <h3 className="text-sm font-bold text-blue-400">
                      {tc(`${category.slug}.title`)}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {categoryTools.map((tool) => (
                        <li key={tool.slug}>
                          <Link
                            href={`/tools/${tool.slug}`}
                            role="menuitem"
                            onClick={close}
                            className="text-sm text-zinc-300 transition hover:text-blue-400"
                          >
                            {tTools(`${tool.slug}.title`)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href="/tools"
            role="menuitem"
            onClick={close}
            className="block border-t border-blue-400/50 px-6 py-4 text-center text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
          >
            {t("viewAllTools")}
          </Link>
        </div>
      )}
    </div>
  );
}
