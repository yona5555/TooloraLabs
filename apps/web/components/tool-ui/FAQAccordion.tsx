"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start font-medium text-zinc-900 transition hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50"
            >
              <span>{item.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
