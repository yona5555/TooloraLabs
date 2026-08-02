import { ReactNode } from "react";

type InfoSectionProps = {
  title: string;
  children: ReactNode;
};

export default function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <section className="border-t border-zinc-200 pt-10 dark:border-zinc-800">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <div className="mt-4 space-y-4 leading-7 text-zinc-600 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}
