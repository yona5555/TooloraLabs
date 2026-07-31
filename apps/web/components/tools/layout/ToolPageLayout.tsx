import { ReactNode } from "react";

type ToolPageLayoutProps = {
  category: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export default function ToolPageLayout({
  category,
  title,
  description,
  children,
}: ToolPageLayoutProps) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        {category}
      </span>

      <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
        {description}
      </p>

      <div className="mt-12">
        {children}
      </div>
    </main>
  );
}
