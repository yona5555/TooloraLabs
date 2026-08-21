"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search as SearchIcon } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { tools } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryIconColor } from "@/lib/category-colors";

type SearchBarProps = {
  placeholder: string;
  searchLabel: string;
};

export default function SearchBar({ placeholder, searchLabel }: SearchBarProps) {
  const t = useTranslations("hero");
  const tTools = useTranslations("tools");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return tools
      .filter((tool) => {
        const title = tTools(`${tool.slug}.title`).toLowerCase();
        const description = tTools(`${tool.slug}.description`).toLowerCase();
        const keywords = tool.keywords.join(" ").toLowerCase();
        return (
          title.includes(normalized) ||
          description.includes(normalized) ||
          keywords.includes(normalized)
        );
      })
      .slice(0, 6);
  }, [query, tTools]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (results.length > 0) {
      router.push(`/tools/${results[0].slug}`);
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="group flex h-18 w-full items-center gap-4 rounded-full border border-zinc-200 bg-white p-2 shadow-xl transition-all duration-300 hover:border-blue-300 hover:shadow-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-none dark:hover:border-blue-500 dark:focus-within:ring-blue-500/20"
      >
        <div className="flex shrink-0 items-center ps-5 text-zinc-400 dark:text-zinc-500">
          <SearchIcon size={22} />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="h-14 min-w-0 flex-1 bg-transparent text-lg text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
        >
          {searchLabel}
        </button>
      </form>

      {isOpen && query.trim() && (
        <div className="absolute inset-x-0 top-full z-20 mt-3 overflow-hidden rounded-3xl border border-zinc-200 bg-white text-start shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          {results.length > 0 ? (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {results.map((tool) => {
                const Icon = getToolIcon(tool.slug);
                return (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 px-6 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getCategoryIconColor(tool.category)}`}
                      >
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block font-semibold text-zinc-900 dark:text-zinc-50">
                          {tTools(`${tool.slug}.title`)}
                        </span>
                        <span className="block text-sm text-zinc-500 dark:text-zinc-400">
                          {tTools(`${tool.slug}.description`)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-6 py-5 text-sm text-zinc-500 dark:text-zinc-400">
              {t("searchNoResults", { query: query.trim() })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
