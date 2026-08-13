"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type PlatformLimitsReferenceProps = {
  characters: number;
};

const LIMITS = [
  { key: "smsMessage", limit: 160 },
  { key: "metaDescription", limit: 160 },
  { key: "xPost", limit: 280 },
  { key: "googleTitleTag", limit: 60 },
  { key: "youtubeTitle", limit: 100 },
  { key: "instagramCaption", limit: 2200 },
] as const;

export default function PlatformLimitsReference({ characters }: PlatformLimitsReferenceProps) {
  const t = useTranslations("tools.word-counter.aboveFold.platformLimits");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-3">
        {LIMITS.map(({ key, limit }) => {
          const ratio = Math.min(characters / limit, 1);
          const over = characters > limit;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{t(`items.${key}`)}</span>
                <span
                  dir="ltr"
                  className={`font-mono text-xs ${over ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"}`}
                >
                  {characters}/{limit}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all ${over ? "bg-red-500" : "bg-blue-500"}`}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
