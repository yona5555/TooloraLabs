"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AgeCalculator as AgeCalculatorTool } from "@tooloralabs/tools";

import ToolButton from "@/components/tool-ui/ToolButton";
import ToolCard from "@/components/tool-ui/ToolCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import AgeResult from "./AgeResult";
import type { AgeResult as AgeResultType } from "./types";

const tool = new AgeCalculatorTool();

export default function AgeCalculator() {
  const t = useTranslations("tools.age-calculator");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AgeResultType | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!birthDate) {
      setError(t("errors.required"));
      return;
    }
    const date = new Date(birthDate);
    if (Number.isNaN(date.getTime())) {
      setError(t("errors.invalidDate"));
      return;
    }
    const now = new Date();
    if (date > now) {
      setError(t("errors.futureDate"));
      return;
    }
    const oldestValidDate = new Date(now);
    oldestValidDate.setFullYear(now.getFullYear() - 120);
    if (date < oldestValidDate) {
      setError(t("errors.tooOld"));
      return;
    }

    const output = tool.execute({ birthDate }, { locale: "en-US" });
    setResult(output.data);
  }

  function handleReset() {
    setBirthDate("");
    setResult(null);
    setError("");
  }

  return (
    <ToolCard title={t("title")} description={t("description")}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ToolInput
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("form.calculate")}</ToolButton>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("form.reset")}
          </button>
        </div>
        {result && <AgeResult result={result} />}
      </form>
    </ToolCard>
  );
}
