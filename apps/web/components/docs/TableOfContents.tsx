"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ThumbsDown, ThumbsUp } from "lucide-react";

export type TocItem = { id: string; label: string };

type Props = {
  items: TocItem[];
};

export default function TableOfContents({ items }: Props) {
  const t = useTranslations("docsNav");
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [feedback, setFeedback] = useState<"idle" | "yes" | "no">("idle");

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
      <div>
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

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        {feedback === "idle" ? (
          <>
            <p className="mb-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("wasThisHelpful")}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFeedback("yes")}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
              >
                <ThumbsUp size={13} />
                {t("yes")}
              </button>
              <button
                type="button"
                onClick={() => setFeedback("no")}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-rose-400 hover:text-rose-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-rose-500 dark:hover:text-rose-400"
              >
                <ThumbsDown size={13} />
                {t("no")}
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{feedback === "yes" ? t("feedbackThanksYes") : t("feedbackThanksNo")}</p>
        )}
      </div>
    </div>
  );
}
