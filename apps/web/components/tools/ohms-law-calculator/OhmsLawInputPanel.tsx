"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import OhmsLawModeTabs from "./OhmsLawModeTabs";
import { FIELDS_BY_PAIR, type OhmsDraft, type OhmsQuantity } from "./OhmsLiveContext";

type OhmsLawInputPanelProps = {
  draft: OhmsDraft;
  onChange: <K extends keyof OhmsDraft>(key: K, value: OhmsDraft[K]) => void;
  onClear: () => void;
};

/** Known pair and its two values; every keystroke updates the whole page live. */
export default function OhmsLawInputPanel({ draft, onChange, onClear }: OhmsLawInputPanelProps) {
  const t = useTranslations("tools.ohms-law-calculator.form");
  const fields = FIELDS_BY_PAIR[draft.pair];

  return (
    <SectionCard phoneRole="input" title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("knownPairLabel")}</span>
        <OhmsLawModeTabs knownPair={draft.pair} onKnownPairChange={(p) => onChange("pair", p)} />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {fields.map((key: OhmsQuantity) => (
          <ToolInput
            key={key}
            label={t(`${key}Label`)}
            type="text"
            inputMode="decimal"
            placeholder={t(`${key}Placeholder`)}
            value={draft[key]}
            onChange={(e) => onChange(key, e.target.value)}
          />
        ))}

        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("clear")}
        </button>
      </form>
    </SectionCard>
  );
}
