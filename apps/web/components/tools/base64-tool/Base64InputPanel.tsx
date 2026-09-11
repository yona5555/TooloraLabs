"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import type { Base64Mode, Base64Variant } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

const SAMPLE_TEXT = "Hello, TooloraLabs! This text will be Base64 encoded.";

type Base64InputPanelProps = {
  text: string;
  onTextChange: (value: string) => void;
  mode: Base64Mode;
  onModeChange: (mode: Base64Mode) => void;
  variant: Base64Variant;
  onVariantChange: (variant: Base64Variant) => void;
  onClear: () => void;
};

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-zinc-300 p-1 dark:border-zinc-700">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            value === opt.value
              ? "bg-blue-600 text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function Base64InputPanel({
  text,
  onTextChange,
  mode,
  onModeChange,
  variant,
  onVariantChange,
  onClear,
}: Base64InputPanelProps) {
  const t = useTranslations("tools.base64-tool.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            onModeChange("encode");
            onTextChange(SAMPLE_TEXT);
          }}
          className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
        >
          {t("loadSampleText")}
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ToggleGroup
            value={mode}
            onChange={onModeChange}
            options={[
              { value: "encode", label: t("encode") },
              { value: "decode", label: t("decode") },
            ]}
          />
          <ToggleGroup
            value={variant}
            onChange={onVariantChange}
            options={[
              { value: "standard", label: t("variantStandard") },
              { value: "urlSafe", label: t("variantUrlSafe") },
            ]}
          />
        </div>

        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("inputLabel")}
          </span>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={t("inputPlaceholder")}
            rows={10}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          />
        </label>

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={16} />
          {t("clear")}
        </button>
      </div>
    </SectionCard>
  );
}
