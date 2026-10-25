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
   * LOCKED phone card order (visuals.md): this card's place among the 3 always-open cards on phone
   * (1 input, 2 output = the card with the result actions, 3 main visual), applied by CSS order
   * (globals.css) at server render. Set on every tool's role cards (scripts/phone-roles.mjs); desktop ignores it. `live-output` = an output shown
   * above the tool (crypto-converter's approved exception: the live result first, the input second).
   * `output-secondary` = a secondary output (a long table or schedule with its own Download / Copy
   * button, e.g. mortgage's payment schedules): only the primary output is always open, so it sits in
   * the collapsed group with its buttons inside it (at most 3 open cards on every tool).
   * `visual-collapsed` = a main visual that leads the collapsed group.
   */
  phoneRole?: PhoneRole;
};

export type PhoneRole = "input" | "output" | "output-secondary" | "visual" | "live-output" | "visual-collapsed";

const headerClassName =
  "flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 text-start lg:px-6 lg:py-3";

const PHONE_QUERY = "(max-width: 767px)";

/**
 * APPROVED PHONE STANDARD (visuals.md, below 768px, tool pages only — `[data-phone-cards]` on the
 * tool page's <main>): the page's first 3 top-level blue-header cards stay open with no toggle; every
 * later card starts collapsed to its blue header and gets an OPEN/CLOSE pill. A page with 3 cards or
 * fewer has no toggles. `PhoneLayoutScript` marks the always-open cards (`data-fixed`) while the HTML
 * is parsed, before the first paint; the collapse itself is CSS only (globals.css), so the body always
 * stays in the HTML. From 768px up nothing here applies: the pill is display:none and every body shows.
 */
const NestedCardContext = createContext(false);

/**
 * False while a card is collapsed on phone and has never been opened: heavy children (canvas charts)
 * wait for it before mounting. True on desktop, in always-open cards and outside any card.
 */
const CardOpenedContext = createContext(true);
export const useCardOpened = () => useContext(CardOpenedContext);

/** Desktop and markets (lib/phone/layout.ts): a card holding a Copy or Share/Export action counts as an output card. */
const OUTPUT_ACTION = "[data-phone-output-action],button:has(svg.lucide-copy,svg.lucide-share-2,svg.lucide-file-down)";

/** Same rule as PhoneLayoutScript, for a card mounted after the page loaded (e.g. a result card). */
function isAlwaysOpen(el: HTMLElement): boolean {
  const scope = el.closest("[data-phone-cards]");
  if (!scope || el.closest('dialog,[role="dialog"]')) return true;
  const cards = Array.from(scope.querySelectorAll<HTMLElement>("[data-card]")).filter((c) => !c.parentElement?.closest("[data-card]") && (c === el || c.getClientRects().length > 0));
  if (cards.length <= 3) return true;
  if (window.matchMedia(PHONE_QUERY).matches && !scope.hasAttribute("data-phone-markets")) {
    // LOCKED phone card order: the server's role cards are open, then the first other cards fill up to 3.
    const isRole = (c: HTMLElement) => /^(input|output|visual|live-output)$/.test(c.getAttribute("data-phone-role") || "");
    if (isRole(el)) return true;
    const roles = cards.filter(isRole).length;
    const collapsedRole = (c: HTMLElement) => /^(output-secondary|visual-collapsed)$/.test(c.getAttribute("data-phone-role") || "");
    return !collapsedRole(el) && cards.filter((c) => !isRole(c) && !collapsedRole(c)).indexOf(el) < 3 - roles;
  }
  if (window.matchMedia(PHONE_QUERY).matches) cards.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return cards.indexOf(el) < 3 || el.hasAttribute("data-phone-output");
}

export default function SectionCard({ title, action, onToggle, children, bodyClassName = "p-4 lg:p-6", className = "", id, phoneRole }: SectionCardProps) {
  const t = useTranslations("common");
  const nested = useContext(NestedCardContext);
  const parentOpened = useCardOpened();
  const ref = useRef<HTMLDivElement>(null);
  const bodyId = `${useId()}-body`;
  // Server default: collapsed (aria-expanded=false); `fixed` = an always-open card (no toggle).
  // A card with its own header toggle (`onToggle`) or inside another card is never collapsed here.
  const [fixed, setFixed] = useState(nested || !!onToggle);
  const [expanded, setExpanded] = useState(false);
  const [opened, setOpened] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!fixed) {
      if (!el.hasAttribute("data-card-init")) {
        const scope = el.closest("[data-phone-cards]");
        if (scope && !scope.hasAttribute("data-phone-markets") && !window.matchMedia(PHONE_QUERY).matches && el.querySelector(OUTPUT_ACTION)) el.setAttribute("data-phone-output", "");
        el.setAttribute("data-card-init", "");
        if (isAlwaysOpen(el)) el.setAttribute("data-fixed", "");
      }
      if (el.hasAttribute("data-fixed")) setFixed(true);
    }
    // Desktop shows every body, so whatever it holds mounts at once there.
    const mq = window.matchMedia(PHONE_QUERY);
    const read = () => {
      if (!mq.matches || el.hasAttribute("data-fixed")) setOpened(true);
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
