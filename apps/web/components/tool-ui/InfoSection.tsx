import { ReactNode } from "react";
import AdSpace from "./AdSpace";
import DesktopAdSlot from "./DesktopAdSlot";

type InfoSectionProps = {
  title: string;
  children: ReactNode;
  /** Anchor id for in-page navigation (e.g. SectionNav) — adds scroll-margin so sticky headers don't cover the target. */
  id?: string;
};

export default function InfoSection({ title, children, id }: InfoSectionProps) {
  return (
    <>
      {/* Desktop ad candidate on this section boundary (lib/ads.ts); kept before the phone slot, whose
          next sibling must stay the section (lib/phone/layout.ts). */}
      <DesktopAdSlot />
      {/* APPROVED PHONE STANDARD: a phone ad slot on every section boundary, display:none until
          lib/phone/layout.ts picks it; never shown from 768px up. */}
      <div data-article-ad="" suppressHydrationWarning className="py-6">
        <AdSpace variant="leaderboard" phone />
      </div>
      <section id={id} data-info-section="" data-phone-disclaimer={id === "notices" ? "" : undefined} className={`border-b border-current/10 pb-12 last:border-b-0 last:pb-0 ${id ? "scroll-mt-32" : ""}`}>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <div data-info-body="" className="mt-4 space-y-4 leading-8">{children}</div>
      </section>
    </>
  );
}
