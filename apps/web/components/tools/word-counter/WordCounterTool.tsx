"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { TextCounter } from "@tooloralabs/tools";

const tool = new TextCounter();

const STAT_KEYS = [
  "words",
  "characters",
  "charactersNoSpaces",
  "sentences",
  "paragraphs",
  "readingTimeMinutes",
] as const;

export default function WordCounterTool() {
  const t = useTranslations("tools.word-counter");
  const [text, setText] = useState("");

  const stats = useMemo(
    () => tool.execute({ text }, { locale: "en-US" }).data,
    [text]
  );

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {t("form.inputLabel")}
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("form.inputPlaceholder")}
          rows={10}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {STAT_KEYS.map((key) => (
          <div
            key={key}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800"
          >
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatLocalizedNumber(stats[key], "western")}
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t(`stats.${key}`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
