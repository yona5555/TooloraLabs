"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CurrencySelector from "@/components/tool-ui/CurrencySelector";
import type { CurrencyCode } from "@/lib/currency";

const QUICK_TIP_PERCENTAGES = [15, 18, 20, 25];

type TipInputPanelProps = {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  billAmount: string;
  onBillAmountChange: (value: string) => void;
  tipPercent: string;
  onTipPercentChange: (value: string) => void;
  people: string;
  onPeopleChange: (value: string) => void;
  roundUpPerPerson: boolean;
  onRoundUpPerPersonChange: (value: boolean) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function TipInputPanel({
  currency,
  onCurrencyChange,
  billAmount,
  onBillAmountChange,
  tipPercent,
  onTipPercentChange,
  people,
  onPeopleChange,
  roundUpPerPerson,
  onRoundUpPerPersonChange,
  onCalculate,
  onClear,
}: TipInputPanelProps) {
  const t = useTranslations("tools.tip-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        <CurrencySelector value={currency} onChange={onCurrencyChange} />

        <ToolInput
          label={t("billLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("billPlaceholder")}
          value={billAmount}
          onChange={(e) => onBillAmountChange(e.target.value)}
        />

        <div>
          <ToolInput
            label={t("tipLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("tipPlaceholder")}
            value={tipPercent}
            onChange={(e) => onTipPercentChange(e.target.value)}
          />
          <div className="mt-2 grid grid-cols-4 gap-2">
            {QUICK_TIP_PERCENTAGES.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => onTipPercentChange(String(pct))}
                className={`rounded-lg border py-2 text-sm font-semibold transition ${
                  Number(tipPercent) === pct
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <ToolInput
          label={t("peopleLabel")}
          type="text"
          inputMode="numeric"
          placeholder={t("peoplePlaceholder")}
          value={people}
          onChange={(e) => onPeopleChange(e.target.value)}
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <input
            type="checkbox"
            checked={roundUpPerPerson}
            onChange={(e) => onRoundUpPerPersonChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
          />
          <span>
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("roundUpLabel")}</span>
            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{t("roundUpHint")}</span>
          </span>
        </label>

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
