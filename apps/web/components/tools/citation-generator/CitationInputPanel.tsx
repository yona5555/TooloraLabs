"use client";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { CitationAuthor, SourceType } from "@tooloralabs/tools";
import { emptyAuthor } from "./types";

export type CitationDraft = {
  sourceType: SourceType;
  authors: CitationAuthor[];
  title: string;
  year: string;
  publisher: string;
  journalName: string;
  volume: string;
  issue: string;
  pages: string;
  siteName: string;
  url: string;
  accessDate: string;
};

type CitationInputPanelProps = {
  draft: CitationDraft;
  onChange: (draft: CitationDraft) => void;
};

export default function CitationInputPanel({ draft, onChange }: CitationInputPanelProps) {
  const t = useTranslations("tools.citation-generator.form");

  function patch(partial: Partial<CitationDraft>) {
    onChange({ ...draft, ...partial });
  }

  function updateAuthor(index: number, partial: Partial<CitationAuthor>) {
    patch({ authors: draft.authors.map((a, i) => (i === index ? { ...a, ...partial } : a)) });
  }

  function addAuthor() {
    patch({ authors: [...draft.authors, emptyAuthor()] });
  }

  function removeAuthor(index: number) {
    patch({ authors: draft.authors.length > 1 ? draft.authors.filter((_, i) => i !== index) : draft.authors });
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-5">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("sourceTypeLabel")}</span>
          <select
            value={draft.sourceType}
            onChange={(e) => patch({ sourceType: e.target.value as SourceType })}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          >
            <option value="book">{t("sourceType.book")}</option>
            <option value="journal-article">{t("sourceType.journal-article")}</option>
            <option value="website">{t("sourceType.website")}</option>
          </select>
        </label>

        <div>
          <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("authorsLabel")}</p>
          <div className="space-y-3">
            {draft.authors.map((author, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <ToolInput
                    label={t("firstNameLabel")}
                    placeholder={t("firstNamePlaceholder")}
                    value={author.firstName}
                    onChange={(e) => updateAuthor(index, { firstName: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <ToolInput
                    label={t("lastNameLabel")}
                    placeholder={t("lastNamePlaceholder")}
                    value={author.lastName}
                    onChange={(e) => updateAuthor(index, { lastName: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAuthor(index)}
                  aria-label={t("removeAuthor")}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAuthor}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Plus size={16} />
              {t("addAuthor")}
            </button>
          </div>
        </div>

        <ToolInput
          label={t("titleLabel")}
          placeholder={t("titlePlaceholder")}
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
        />

        <ToolInput label={t("yearLabel")} placeholder={t("yearPlaceholder")} value={draft.year} onChange={(e) => patch({ year: e.target.value })} />

        {draft.sourceType === "book" && (
          <ToolInput
            label={t("publisherLabel")}
            placeholder={t("publisherPlaceholder")}
            value={draft.publisher}
            onChange={(e) => patch({ publisher: e.target.value })}
          />
        )}

        {draft.sourceType === "journal-article" && (
          <>
            <ToolInput
              label={t("journalNameLabel")}
              placeholder={t("journalNamePlaceholder")}
              value={draft.journalName}
              onChange={(e) => patch({ journalName: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-3">
              <ToolInput label={t("volumeLabel")} value={draft.volume} onChange={(e) => patch({ volume: e.target.value })} />
              <ToolInput label={t("issueLabel")} value={draft.issue} onChange={(e) => patch({ issue: e.target.value })} />
              <ToolInput label={t("pagesLabel")} placeholder={t("pagesPlaceholder")} value={draft.pages} onChange={(e) => patch({ pages: e.target.value })} />
            </div>
          </>
        )}

        {draft.sourceType === "website" && (
          <>
            <ToolInput
              label={t("siteNameLabel")}
              placeholder={t("siteNamePlaceholder")}
              value={draft.siteName}
              onChange={(e) => patch({ siteName: e.target.value })}
            />
            <ToolInput label={t("urlLabel")} placeholder={t("urlPlaceholder")} value={draft.url} onChange={(e) => patch({ url: e.target.value })} />
            <ToolInput
              label={t("accessDateLabel")}
              placeholder={t("accessDatePlaceholder")}
              value={draft.accessDate}
              onChange={(e) => patch({ accessDate: e.target.value })}
            />
          </>
        )}
      </div>
    </SectionCard>
  );
}
