"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import FnIndicatorCard, { FnIndicatorUnavailable } from "./FnIndicatorCard";
import { CLASS_BG, useFnModel } from "./FnLiveContext";

const enc = new TextEncoder();

/**
 * Interactive piece: every character of the original name as a chip coloured by its kind. Click one to
 * read its code point, its UTF-8 bytes and what the sanitizer does with it.
 */
export default function FnCharExplorer() {
  const t = useTranslations("tools.file-name-sanitizer.education.lab.explorer");
  const tc = useTranslations("tools.file-name-sanitizer.education.lab.classes");
  const { draft, a } = useFnModel();
  const [pick, setPick] = useState(2);
  if (!a || a.chars.length === 0) return <FnIndicatorUnavailable title={t("title")} />;

  const i = Math.min(pick, a.chars.length - 1);
  const c = a.chars[i];
  const bytes = [...enc.encode(c.ch)].map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
  const fate =
    c.cls === "illegal"
      ? t("fateRemoved")
      : c.cls === "space"
        ? t("fateSeparator", { s: draft.separator })
        : c.cls === "accented" && draft.transliterate
          ? t("fateStripped", { s: c.ch.normalize("NFKD").replace(/[̀-ͯ]/g, "") })
          : draft.lowercase && c.ch !== c.ch.toLowerCase()
            ? t("fateLower", { s: c.ch.toLowerCase() })
            : t("fateKept");

  const indicator = (
    <div className="w-[340px] max-w-full">
      <div dir="ltr" className="flex flex-wrap gap-1">
        {a.chars.map((x, k) => (
          <button
            key={k}
            type="button"
            onClick={() => setPick(k)}
            aria-pressed={k === i}
            className={`flex h-10 min-w-8 items-center justify-center rounded-md px-1.5 font-mono text-base font-bold text-white transition ${CLASS_BG[x.cls]} ${k === i ? "ring-4 ring-blue-300 dark:ring-blue-500/60" : "opacity-80 hover:opacity-100"}`}
          >
            {x.cls === "space" ? "␣" : x.ch}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );

  return (
    <FnIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("position"), value: `${i + 1} / ${a.chars.length}` },
        { label: t("char"), value: c.cls === "space" ? "␣" : c.ch },
        { label: t("code"), value: `U+${c.code.toString(16).toUpperCase().padStart(4, "0")}` },
        { label: t("utf8"), value: bytes },
        { label: t("kind"), value: tc(c.cls) },
        { label: t("fate"), value: fate, emphasize: true },
      ]}
    />
  );
}
