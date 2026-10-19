"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import HelpfulFeedback from "./HelpfulFeedback";

export type TocItem = { id: string; label: string };

type Props = {
  items: TocItem[];
};

export default function TableOfContents({ items }: Props) {
  const t = useTranslations("docsNav");
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );

    const elements = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-6 text-sm">
      <div data-bp-panel data-toc-list>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("onThisPage")}</p>
        <ul className="flex flex-col gap-0.5 border-s border-zinc-200 dark:border-zinc-800">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`-ms-px block w-full border-s-2 px-3 py-1 text-start transition ${
                  activeId === item.id
                    ? "border-blue-600 font-medium text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <HelpfulFeedback />
    </div>
  );
}
