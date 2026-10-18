"use client";
import { useTranslations } from "next-intl";
import B64IndicatorCard, { B64IndicatorUnavailable } from "./B64IndicatorCard";
import { useB64Model } from "./B64LiveContext";

const SHOW = 44;

/**
 * Type #11 (Side-by-Side Equivalence): the same bytes in standard Base64 (RFC 4648 §4) and URL-safe
 * Base64 (§5) one above the other; the characters that differ ("+" → "-", "/" → "_", padding) are marked.
 */
export default function B64VariantCompare() {
  const t = useTranslations("tools.base64-tool.education.lab.variants");
  const { a, f } = useB64Model();
  if (!a) return <B64IndicatorUnavailable title={t("title")} />;

  const std = a.standard.slice(0, SHOW);
  const url = a.urlSafe.slice(0, SHOW);
  const diff = [...a.standard].filter((c, i) => c !== a.urlSafe[i]).length;

  const line = (s: string, other: string, label: string, cls: string) => (
    <div>
      <p className="mb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
      <p dir="ltr" className="font-mono text-sm leading-7 break-all">
        {[...s].map((c, i) => (
          <span key={i} className={c !== other[i] ? `rounded px-0.5 font-bold text-white ${cls}` : "text-zinc-700 dark:text-zinc-200"}>
            {c}
          </span>
        ))}
        {a.standard.length > SHOW && <span className="text-zinc-400">…</span>}
      </p>
    </div>
  );

  const indicator = (
    <div className="w-[340px] max-w-full space-y-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
      {line(std, url, t("standard"), "bg-blue-600 dark:bg-blue-500")}
      {line(url, std, t("urlSafe"), "bg-emerald-600 dark:bg-emerald-500")}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("legend")}</p>
    </div>
  );

  return (
    <B64IndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("stdLength"), value: f(a.standard.length) },
        { label: t("urlLength"), value: f(a.urlSafe.length) },
        { label: t("plus"), value: f([...a.standard].filter((c) => c === "+").length) },
        { label: t("slash"), value: f([...a.standard].filter((c) => c === "/").length) },
        { label: t("differ"), value: f(diff), emphasize: true },
      ]}
    />
  );
}
