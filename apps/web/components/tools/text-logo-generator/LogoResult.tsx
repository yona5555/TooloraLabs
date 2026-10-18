"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import TextLogoShareExportModal from "./TextLogoShareExportModal";
import TlStyleRings from "./TlStyleRings";
import { useTlLive } from "./TlLiveContext";

type Row = { key: string; label: string; value: string; note?: string; strong?: boolean };

export default function LogoResult() {
  const t = useTranslations("tools.text-logo-generator.result");
  const tl = useTranslations("tools.text-logo-generator.live.table");
  const { ok, styles, active, activeStyle, setActiveStyle, plain, styleName, f, pct } = useTlLive();

  if (!ok) {
    return (
      <SectionCard title={t("heading")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col lg:justify-center">
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm leading-6 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">{t("emptyText")}</p>
      </SectionCard>
    );
  }

  const rows: Row[] = [
    { key: "style", label: tl("style"), value: styleName(activeStyle), strong: true },
    { key: "characters", label: tl("characters"), value: f(active.characters) },
    { key: "mapped", label: tl("mapped"), value: f(active.mapped), note: pct(active.characters ? active.mapped / active.characters : 0) },
    { key: "exceptions", label: tl("exceptions"), value: f(active.exceptions), note: tl("exceptionsNote") },
    { key: "kept", label: tl("kept"), value: f(active.unchanged + active.other), note: tl("keptNote", { latin: f(active.unchanged), other: f(active.other) }) },
    { key: "utf16", label: tl("utf16"), value: f(active.utf16), note: tl("plainNote", { n: f(plain.utf16) }) },
    { key: "utf8", label: tl("utf8"), value: f(active.utf8), note: tl("plainNote", { n: f(plain.utf8) }) },
    { key: "ratio", label: tl("ratio"), value: `×${f(plain.utf8 ? active.utf8 / plain.utf8 : 0, 2)}`, note: `${f(active.utf8)} ÷ ${f(plain.utf8)}` },
  ];

  return (
    <SectionCard
      title={t("heading")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:p-5 lg:flex lg:flex-1 lg:flex-col"
      action={
        <TextLogoShareExportModal
          inputRows={[]}
          resultRows={styles.map((s) => ({ label: styleName(s.style), value: s.styled }))}
          heroLabel={styleName(active.style)}
          heroValue={active.styled}
          sentence={active.styled}
        />
      }
    >
      <ul className="space-y-1.5">
        {styles.map((s) => {
          const on = s.style === activeStyle;
          return (
            <li
              key={s.style}
              onClick={() => setActiveStyle(s.style)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-colors ${
                on
                  ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400 dark:border-amber-400/60 dark:bg-amber-500/10"
                  : "border-zinc-100 bg-zinc-50 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-blue-500/10"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{styleName(s.style)}</p>
                <p dir="ltr" className="mt-0.5 truncate text-lg text-zinc-800 dark:text-zinc-100">{s.styled}</p>
              </div>
              <CopyButton text={s.styled} />
            </li>
          );
        })}
      </ul>
      <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">{tl("selectHint")}</p>

      <div className="mt-3 flex flex-col-reverse gap-4 lg:flex-1">
        <table className="min-w-0 flex-1 border-collapse text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-zinc-200 last:border-0 dark:border-zinc-700/70">
                <th scope="row" className="py-1.5 pe-2 text-start align-top font-medium text-zinc-600 dark:text-zinc-300">
                  {r.label}
                  {r.note && <span dir="auto" className="block text-[11px] font-normal text-zinc-400 dark:text-zinc-500">{r.note}</span>}
                </th>
                <td
                  dir={r.key === "style" ? "auto" : "ltr"}
                  className={`py-1.5 text-end align-top font-semibold tabular-nums ${r.strong ? "text-blue-700 dark:text-blue-400" : "font-mono text-zinc-900 dark:text-zinc-100"}`}
                >
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TlStyleRings />
      </div>
    </SectionCard>
  );
}
