import { ReactNode } from "react";

type ToolCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function ToolCard({
  title,
  description,
  children,
}: ToolCardProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900">
          {title}
        </h2>

        {description && (
          <p className="mt-3 text-zinc-600">
            {description}
          </p>
        )}
      </header>

      {children}
    </section>
  );
}
