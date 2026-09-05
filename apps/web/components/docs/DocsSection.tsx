import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  children: ReactNode;
};

export default function DocsSection({ id, title, children }: Props) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-zinc-200 py-8 first:border-t-0 first:pt-0 dark:border-zinc-800">
      <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      {children}
    </section>
  );
}
