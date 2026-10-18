"use client";
import { useTranslations } from "next-intl";
import FnIndicatorCard, { FnIndicatorUnavailable } from "./FnIndicatorCard";
import { sanitize, useFnLive, useFnModel, type FnDraft } from "./FnLiveContext";

/**
 * Type #16 (Side-by-Side Comparison Cards): the same name sanitized with the four combinations of
 * separator ("-" or "_") and lower-casing, each produced by the tool itself. Click one to adopt it.
 */
export default function FnVariants() {
  const t = useTranslations("tools.file-name-sanitizer.education.lab.variants");
  const { setDim } = useFnLive();
  const { draft, a, f } = useFnModel();
  if (!a) return <FnIndicatorUnavailable title={t("title")} />;

  const combos: Pick<FnDraft, "separator" | "lowercase">[] = [
    { separator: "-", lowercase: true },
    { separator: "_", lowercase: true },
    { separator: "-", lowercase: false },
    { separator: "_", lowercase: false },
  ];
  const results = combos.map((c) => {
    const r = sanitize({ ...draft, ...c });
    return { ...c, name: r.success ? r.data.result : "—" };
  });

  const indicator = (
    <div className="grid w-[340px] max-w-full grid-cols-1 gap-2">
      {results.map((r) => {
        const active = r.separator === draft.separator && r.lowercase === draft.lowercase;
        return (
          <button
            key={`${r.separator}${r.lowercase}`}
            type="button"
            onClick={() => {
              setDim("separator", r.separator);
              setDim("lowercase", r.lowercase);
            }}
            className={`rounded-xl border px-3 py-2.5 text-start transition ${active ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/15" : "border-zinc-200 bg-zinc-50 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-800/40"}`}
          >
            <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              &quot;{r.separator}&quot; · {r.lowercase ? t("lower") : t("keepCase")}
            </span>
            <code dir="auto" className="block font-mono text-sm font-semibold break-all text-zinc-800 dark:text-zinc-100">
              {r.name}
            </code>
          </button>
        );
      })}
    </div>
  );

  const distinct = new Set(results.map((r) => r.name)).size;
  return (
    <FnIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("distinct"), value: `${f(distinct, 0)} / 4` },
        { label: t("dash"), value: t("dashUse") },
        { label: t("underscore"), value: t("underscoreUse") },
        { label: t("case"), value: t("caseUse") },
        { label: t("current"), value: `"${draft.separator}" · ${draft.lowercase ? t("lower") : t("keepCase")}`, emphasize: true },
      ]}
    />
  );
}
