"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CopyButton from "@/components/tool-ui/CopyButton";
import { SITE_URL } from "@/lib/site";

const EMBEDDABLE_TOOLS = [{ slug: "bmi-calculator", labelKey: "bmi-calculator" }] as const;

export default function EmbedCodeGenerator() {
  const t = useTranslations("embedTools.docsPage.generator");
  const tTools = useTranslations("tools");
  const locale = useLocale();

  const [slug, setSlug] = useState<(typeof EMBEDDABLE_TOOLS)[number]["slug"]>("bmi-calculator");
  const [width, setWidth] = useState("420");
  const [height, setHeight] = useState("760");

  // Absolute URL for the copy-paste snippet — external sites need a real domain.
  const embedUrl = `${SITE_URL}/embed/${slug}?locale=${locale}`;
  // Relative URL for the on-page preview — resolves correctly in every environment
  // (local dev, staging, production) instead of always pointing at the production domain.
  const previewUrl = `/embed/${slug}?locale=${locale}`;

  const code = useMemo(
    () =>
      `<iframe src="${embedUrl}" width="${width || "100%"}" height="${height || "760"}" style="border:1px solid #e4e4e7;border-radius:12px;" title="${tTools(`${slug}.title`)} — TooloraLabs" loading="lazy"></iframe>`,
    [embedUrl, width, height, slug, tTools],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-1.5 sm:col-span-1">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("toolLabel")}</span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value as (typeof EMBEDDABLE_TOOLS)[number]["slug"])}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {EMBEDDABLE_TOOLS.map((tool) => (
              <option key={tool.slug} value={tool.slug}>
                {tTools(`${tool.labelKey}.title`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("widthLabel")}</span>
          <input
            type="text"
            inputMode="numeric"
            value={width}
            onChange={(e) => setWidth(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("heightLabel")}</span>
          <input
            type="text"
            inputMode="numeric"
            value={height}
            onChange={(e) => setHeight(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("codeLabel")}</span>
          <CopyButton text={code} />
        </div>
        <textarea
          readOnly
          dir="ltr"
          value={code}
          rows={3}
          className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("previewLabel")}</span>
        <div className="overflow-auto rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <iframe
            src={previewUrl}
            width={width || "100%"}
            height={height || "760"}
            style={{ border: "1px solid #e4e4e7", borderRadius: 12, background: "white" }}
            title={`${tTools(`${slug}.title`)} — TooloraLabs`}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
