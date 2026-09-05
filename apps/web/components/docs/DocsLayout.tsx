import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Menu } from "lucide-react";
import DocsSidebarNav from "./DocsSidebarNav";

type DocsLayoutProps = {
  children: ReactNode;
  toc: ReactNode;
};

export default async function DocsLayout({ children, toc }: DocsLayoutProps) {
  const t = await getTranslations("docsNav");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <details className="group mb-6 rounded-xl border border-zinc-200 bg-white lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-zinc-700 marker:content-none dark:text-zinc-200">
          <Menu size={16} />
          {t("browseDocs")}
        </summary>
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <DocsSidebarNav />
        </div>
      </details>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)_220px] lg:gap-10">
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <DocsSidebarNav />
          </div>
        </div>

        <div className="min-w-0">{children}</div>

        <div className="hidden lg:block">
          <div className="sticky top-24">{toc}</div>
        </div>
      </div>
    </main>
  );
}
