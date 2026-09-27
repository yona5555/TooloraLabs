import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import BackButton from "@/components/tool-ui/BackButton";

type Section = {
  heading: string;
  body: string;
};

type Props = {
  title: string;
  updated?: string;
  intro?: string;
  sections?: Section[];
  children?: ReactNode;
};

export default async function LegalPageLayout({
  title,
  updated,
  intro,
  sections,
  children,
}: Props) {
  const tCommon = await getTranslations("common");

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <div className="flex items-center gap-3">
        <BackButton href="/" label={tCommon("backToHome")} size={20} className="h-10 w-10" />
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
      </div>

      {updated && (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{updated}</p>
      )}

      {intro && (
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          {intro}
        </p>
      )}

      {sections && sections.length > 0 && (
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {section.heading}
              </h2>
              <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-300">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      )}

      {children}
    </main>
  );
}
