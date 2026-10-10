"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import GcfLcmLive3D from "./GcfLcmLive3D";
import GcfLcmShareExportModal from "./GcfLcmShareExportModal";
import { useGcfLcmModel } from "./GcfLcmLiveContext";
import type { GcfLcmError } from "./types";

/**
 * Result card: GCF and LCM up top, then the deep live table + 3D prime-factor towers. While a field
 * is empty or invalid the card says so and keeps showing the last valid set (never an empty state).
 */
export default function GcfLcmResult({ error, className = "" }: { error: GcfLcmError | null; className?: string }) {
  const t = useTranslations("tools.gcf-lcm-calculator.result");
  const { nums, result, f } = useGcfLcmModel();
  const list = nums.map((n) => f(n)).join(", ");
  const sentence = t("sentence", { numbers: list, gcf: f(result.gcf), lcm: f(result.lcm) });

  return (
    <SectionCard
      title={t("heading")}
      className={`lg:flex lg:h-full lg:flex-col ${className}`}
      bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col"
      action={
        <GcfLcmShareExportModal
          inputRows={[{ label: t("numbersLabel"), value: list }]}
          resultRows={[
            { label: t("gcfLabel"), value: f(result.gcf) },
            { label: t("lcmLabel"), value: f(result.lcm) },
          ]}
          heroLabel={t("gcfLabel")}
          heroValue={f(result.gcf)}
          sentence={sentence}
        />
      }
    >
      {error && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          {t(error === "too-few-numbers" ? "tooFewNumbers" : "invalidNumber")}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t("gcfLabel")}</p>
          <p dir="ltr" className="font-mono text-2xl font-bold break-all text-emerald-700 dark:text-emerald-300">{f(result.gcf)}</p>
        </div>
        <div className="rounded-xl bg-violet-50 px-3 py-2 dark:bg-violet-500/10">
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">{t("lcmLabel")}</p>
          <p dir="ltr" className="font-mono text-2xl font-bold break-all text-violet-700 dark:text-violet-300">{f(result.lcm)}</p>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-zinc-600 dark:text-zinc-300">{sentence}</p>
      <div className="mt-4 border-t border-zinc-100 pt-4 lg:flex lg:flex-1 lg:flex-col dark:border-zinc-800">
        <LiveTableFill>
          <GcfLcmLive3D />
        </LiveTableFill>
      </div>
    </SectionCard>
  );
}
