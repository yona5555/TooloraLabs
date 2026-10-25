"use client";
import { createContext, useContext, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import DesktopAdSlot from "./DesktopAdSlot";

type SectionCardProps = {
  title: ReactNode;
  action?: ReactNode;
  onToggle?: () => void;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
  /** Anchor id for in-page navigation (e.g. SectionNav) — adds scroll-margin so sticky headers don't cover the target. */
  id?: string;
  /**
   * LOCKED phone card order (visuals.md): this card's place on phone, applied by CSS order (globals.css)
   * from the server HTML; desktop ignores it. The always-open cards are exactly the cards with an open
   * role: 1 `input`, 2 `output` (the card with the result actions), 3 `visual` (the main visual), and
   * `extra` = an always-open card that fills a page's 3 open places after those (e.g. Quick examples).
   * `live-output` = an output shown above the tool (the markets tools' approved exception: the live
   * result first, the input second). `output-secondary` = a secondary output (a long table or schedule
   * with its own Download / Copy button, e.g. mortgage's payment schedules) and `visual-collapsed` = a
   * main visual that leads the collapsed group: both stay in the collapsed group (at most 3 open cards).
   */
  phoneRole?: PhoneRole;
};

export type PhoneRole = "input" | "output" | "output-secondary" | "visual" | "live-output" | "visual-collapsed" | "extra";

/** The roles of the always-open cards on phone (`data-fixed` + `data-phone-open`; globals.css never collapses them). */
const OPEN_ROLES: ReadonlySet<PhoneRole> = new Set<PhoneRole>(["input", "output", "visual", "live-output", "extra"]);

const headerClassName =
  "flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 text-start lg:px-6 lg:py-3";

const PHONE_QUERY = "(max-width: 767px)";

/**
 * APPROVED PHONE STANDARD (visuals.md, below 768px, tool pages only — `[data-phone-cards]` on the
 * tool page's <main>): the cards with an open `phoneRole` stay open with no toggle (at most 3 per page);
 * every other top-level card starts collapsed to its blue header and gets an OPEN/CLOSE pill. Both are
 * decided at server render (`data-fixed`), and the collapse itself is CSS only (globals.css), so the body
 * always stays in the HTML and nothing changes after the first paint. Cards in a dialog never collapse.
 * From 768px up nothing here applies: the pill is display:none and every body shows.
 */
const NestedCardContext = createContext(false);

/**
 * False while a card is collapsed on phone and has never been opened: heavy children (canvas charts)
 * wait for it before mounting. True on desktop, in always-open cards and outside any card.
 */
const CardOpenedContext = createContext(true);
export const useCardOpened = () => useContext(CardOpenedContext);

export default function SectionCard({ title, action, onToggle, children, bodyClassName = "p-4 lg:p-6", className = "", id, phoneRole }: SectionCardProps) {
  const t = useTranslations("common");
  const nested = useContext(NestedCardContext);
  const parentOpened = useCardOpened();
  const ref = useRef<HTMLDivElement>(null);
  const bodyId = `${useId()}-body`;
  // `fixed` = an always-open card (no toggle): an open phone role, a card with its own header toggle
  // (`onToggle`) or a card inside another card. Every other card is collapsed on phone (aria-expanded=false).
  const [fixed, setFixed] = useState(nested || !!onToggle || (!!phoneRole && OPEN_ROLES.has(phoneRole)));
  const [expanded, setExpanded] = useState(false);
  const [opened, setOpened] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // A dialog's cards are mounted on the client when it opens, so this runs before their first paint.
    const inDialog = !fixed && !!el.closest('dialog,[role="dialog"]');
    if (inDialog) setFixed(true);
    // Desktop shows every body, so whatever it holds mounts at once there.
    const mq = window.matchMedia(PHONE_QUERY);
    const read = () => {
      if (!mq.matches || fixed || inDialog) setOpened(true);
    };
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    setExpanded((v) => !v);
    setOpened(true);
  }

  const heading = <h2 className="font-bold text-white max-md:me-auto">{title}</h2>;

  return (
    <>
    {/* Desktop ad candidate on the boundary before a top-level card (lib/ads.ts picks 3 per page). */}
    {!nested && <DesktopAdSlot />}
    <div
      ref={ref}
      id={id}
      data-bp-panel
      data-card=""
      data-phone-role={phoneRole}
      data-phone-open={phoneRole && OPEN_ROLES.has(phoneRole) ? "" : undefined}
      data-state={fixed || expanded ? "open" : "closed"}
      data-fixed={fixed ? "" : undefined}
      suppressHydrationWarning
      className={`rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none ${id ? "scroll-mt-32" : ""} ${className}`}
    >
      {onToggle ? (
        <button type="button" onClick={onToggle} data-card-header="" className={headerClassName}>
          {heading}
          {action}
        </button>
      ) : (
        <div data-card-header="" className={headerClassName}>
          {heading}
          {action}
          {!fixed && (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={expanded}
              aria-controls={bodyId}
              data-card-toggle=""
              className="-my-2.5 -me-2 hidden h-11 min-w-11 shrink-0 items-center justify-center rounded-full px-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="flex h-8 items-center gap-1 whitespace-nowrap rounded-full border border-white/50 bg-white/15 ps-3 pe-2 text-xs font-bold uppercase tracking-wide">
                {expanded ? t("cardClose") : t("cardOpen")}
                <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} />
              </span>
            </button>
          )}
        </div>
      )}

      <div id={bodyId} data-card-body className={bodyClassName}>
        <CardOpenedContext.Provider value={opened && parentOpened}>
          <NestedCardContext.Provider value>{children}</NestedCardContext.Provider>
        </CardOpenedContext.Provider>
      </div>
    </div>
    </>
  );
}
