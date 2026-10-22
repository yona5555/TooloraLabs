"use client";
import { useTranslations } from "next-intl";
import { TEXT_LOGO_STYLES, textLogoBases, textLogoExceptions } from "@tooloralabs/tools";
import TlIndicatorCard from "./TlIndicatorCard";
import { hex, useTlLive } from "./TlLiveContext";

const ROWS = TEXT_LOGO_STYLES.flatMap((style) =>
  textLogoExceptions(style).map(([source, styled]) => {
    const b = textLogoBases(style);
    const isDigit = source >= "0" && source <= "9";
    const base = isDigit ? b.digit ?? 0 : source === source.toUpperCase() ? b.upper : b.lower;
    const offset = source.charCodeAt(0) - (isDigit ? 48 : source === source.toUpperCase() ? 65 : 97);
    return { style, source, styled, cp: styled.codePointAt(0) ?? 0, hole: base + offset };
  }),
);

/** Tagged reference table (§31 #17): every place Unicode reuses an older character instead of the block offset, tagged when your text uses it. */
export default function TlExceptions() {
  const t = useTranslations("tools.text-logo-generator.live.exceptions");
  const { source, active, activeStyle, setActiveStyle, styleName, f } = useTlLive();
  const used = new Set(Array.from(source));
  const hits = ROWS.filter((r) => used.has(r.source));
  const mine = ROWS.filter((r) => r.style === activeStyle);

  const indicator = (
    <div className="max-h-72 w-full max-w-sm overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <tr>
            <th className="px-2 py-1.5 text-start font-semibold">{t("style")}</th>
            <th className="px-2 py-1.5 font-semibold">{t("char")}</th>
            <th className="px-2 py-1.5 font-semibold">{t("hole")}</th>
            <th className="px-2 py-1.5 font-semibold">{t("used")}</th>
            <th className="px-2 py-1.5 text-end font-semibold">{t("tag")}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => {
            const hit = used.has(r.source);
            const on = r.style === activeStyle;
            return (
              <tr
                key={`${r.style}-${r.source}`}
                onClick={() => setActiveStyle(r.style)}
                className={`cursor-pointer border-t border-zinc-100 transition-colors dark:border-zinc-800 ${on ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`}
              >
                <td className="px-2 py-1 text-zinc-700 dark:text-zinc-200">{styleName(r.style)}</td>
                <td dir="ltr" className="px-2 py-1 text-center">
                  <span className="text-zinc-500">{r.source}</span> → <span className="text-base text-zinc-900 dark:text-zinc-50">{r.styled}</span>
                </td>
                <td dir="ltr" className="px-2 py-1 text-center font-mono text-[10px] text-zinc-400 line-through">{hex(r.hole)}</td>
                <td dir="ltr" className="px-2 py-1 text-center font-mono text-[10px] text-blue-700 dark:text-blue-300">{hex(r.cp)}</td>
                <td className="px-2 py-1 text-end">
                  {hit && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">{t("inText")}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <TlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("total"), value: f(ROWS.length) },
        { label: t("forStyle", { style: styleName(activeStyle) }), value: mine.length ? mine.map((r) => r.styled).join(" ") : "—" },
        { label: t("hits"), value: f(hits.length), emphasize: true, note: hits.length ? hits.map((r) => `${r.source}→${r.styled}`).join(" ") : t("none") },
        { label: t("activeHits"), value: f(active.exceptions) },
      ]}
    />
  );
}
