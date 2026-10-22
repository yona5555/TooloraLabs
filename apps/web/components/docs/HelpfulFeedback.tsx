"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ThumbsDown, ThumbsUp } from "lucide-react";

/** The "Was this helpful?" card shared by the /docs table of contents and the /tools side nav. */
export default function HelpfulFeedback() {
  const t = useTranslations("docsNav");
  const [feedback, setFeedback] = useState<"idle" | "yes" | "no">("idle");

  return (
    <div data-bp-panel className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
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
  );
}
