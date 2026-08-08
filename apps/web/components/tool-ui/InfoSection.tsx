import { ReactNode } from "react";

type InfoSectionProps = {
  title: string;
  children: ReactNode;
  /** Anchor id for in-page navigation (e.g. SectionNav) — adds scroll-margin so sticky headers don't cover the target. */
  id?: string;
};

export default function InfoSection({ title, children, id }: InfoSectionProps) {
  return (
    <section id={id} className={`border-b border-current/10 pb-12 last:border-b-0 last:pb-0 ${id ? "scroll-mt-32" : ""}`}>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 leading-8">{children}</div>
    </section>
  );
}
