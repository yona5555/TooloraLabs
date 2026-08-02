import { ReactNode } from "react";

type InfoSectionProps = {
  title: string;
  children: ReactNode;
};

export default function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <section className="border-b border-current/10 pb-12 last:border-b-0 last:pb-0">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 leading-8">{children}</div>
    </section>
  );
}
