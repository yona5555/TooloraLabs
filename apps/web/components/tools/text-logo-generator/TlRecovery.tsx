"use client";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import TlIndicatorCard from "./TlIndicatorCard";
import { useTlLive } from "./TlLiveContext";

/** Side-by-side equivalence (§31 #11): each styled string after NFKC compatibility folding — what search indexes and many text pipelines compare. */
export default function TlRecovery() {
  const t = useTranslations("tools.text-logo-generator.live.recovery");
  const { styles, source, active, activeStyle, setActiveStyle, styleName, f } = useTlLive();
  const matches = styles.filter((s) => s.recovered === source).length;

  const indicator = (
    <ul className="w-full max-w-sm space-y-1">
      {styles.map((s) => {
        const ok = s.recovered === source;
        const on = s.style === activeStyle;
        return (
          <li
            key={s.style}
            onClick={() => setActiveStyle(s.style)}
            dir="ltr"
            className={`grid cursor-pointer grid-cols-[1fr_auto_1fr_auto] items-center gap-2 rounded-lg border px-2 py-1 text-sm transition-colors ${
              on ? "border-amber-400 bg-amber-50 dark:border-amber-400/60 dark:bg-amber-500/10" : "border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            }`}
          >
            <span className="truncate text-zinc-900 dark:text-zinc-50">{s.styled}</span>
            <span className="font-mono text-[10px] text-zinc-400">NFKC →</span>
            <span className="min-w-0 break-words text-zinc-600 dark:text-zinc-300">{s.recovered}</span>
            {ok ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <X size={14} className="text-rose-600 dark:text-rose-400" />}
          </li>
        );
      })}
    </ul>
  );

  return (
    <TlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("styled", { style: styleName(active.style) }), value: active.styled },
        { label: t("changed"), value: f(active.mapped), note: t("changedNote", { n: f(active.characters) }) },
        { label: t("recovered"), value: active.recovered },
        { label: t("match"), value: active.recovered === source ? t("yes") : t("no"), emphasize: true },
        { label: t("all"), value: `${f(matches)} / ${f(styles.length)}` },
      ]}
    />
  );
}
