"use client";
import { createContext, useContext, useId, useLayoutEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

type SectionCardProps = {
  title: ReactNode;
  action?: ReactNode;
  onToggle?: () => void;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
  /** Anchor id for in-page navigation (e.g. SectionNav) — adds scroll-margin so sticky headers don't cover the target. */
  id?: string;
};

const headerClassName =
  "flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 text-start lg:px-6 lg:py-3";

const PHONE_QUERY = "(max-width: 767px)";

/**
 * PHONE PILOT (crypto-converter only, pending Yousef's approval): cards rendered inside
 * `<PhoneCollapsibleCards>` collapse below 768px. Everywhere else (other tools, desktop) this is false
 * and SectionCard renders exactly the markup it always had.
 */
const PhoneCollapsibleContext = createContext(false);
export function PhoneCollapsibleCards({ children }: { children: ReactNode }) {
  return <PhoneCollapsibleContext.Provider value>{children}</PhoneCollapsibleContext.Provider>;
}

/**
 * False while a pilot card is collapsed on phone and has never been opened: heavy children (canvas
 * charts) wait for it before mounting. Always true on desktop and outside a collapsible card.
 */
const CardOpenedContext = createContext(true);
export const useCardOpened = () => useContext(CardOpenedContext);

export default function SectionCard(props: SectionCardProps) {
  const collapsible = useContext(PhoneCollapsibleContext);
  if (collapsible) return <CollapsibleSectionCard {...props} />;

  const { title, action, onToggle, children, bodyClassName = "p-4 lg:p-6", className = "", id } = props;
  const heading = <h2 className="font-bold text-white">{title}</h2>;

  return (
    <div
      id={id}
      data-bp-panel
      className={`rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none ${id ? "scroll-mt-32" : ""} ${className}`}
    >
      {onToggle ? (
        <button type="button" onClick={onToggle} className={headerClassName}>
          {heading}
          {action}
        </button>
      ) : (
        <div className={headerClassName}>
          {heading}
          {action}
        </div>
      )}

      <div data-card-body className={bodyClassName}>
        {children}
      </div>
    </div>
  );
}

/**
 * Below 768px the card starts collapsed to its blue header (border dropped, so its height is the
 * header's); the OPEN/CLOSE pill at the header's end toggles it. The body stays in the HTML, hidden
 * with CSS only. From 768px up nothing here applies: the pill is hidden and the body always shows.
 */
function CollapsibleSectionCard({ title, action, children, bodyClassName = "p-4 lg:p-6", className = "", id }: SectionCardProps) {
  const t = useTranslations("common");
  const bodyId = `${useId()}-body`;
  // Server default: collapsed (aria-expanded=false), which is what a phone shows first.
  const [expanded, setExpanded] = useState(false);
  const [opened, setOpened] = useState(false);

  // Desktop shows every body, so whatever it holds mounts at once there.
  useLayoutEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const read = () => {
      if (!mq.matches) setOpened(true);
    };
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  function toggle() {
    setExpanded((v) => !v);
    setOpened(true);
  }

  const collapsed = !expanded;

  return (
    <div
      id={id}
      data-bp-panel
      data-card=""
      data-state={collapsed ? "closed" : "open"}
      className={`rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none ${collapsed ? "max-md:border-0" : ""} ${id ? "scroll-mt-32" : ""} ${className}`}
    >
      <div data-card-header="" className={`${headerClassName} ${collapsed ? "max-md:rounded-b-2xl" : ""}`}>
        <h2 className="font-bold text-white max-md:me-auto">{title}</h2>
        {action}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls={bodyId}
          data-card-toggle=""
          className="-my-2.5 -me-2 flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full px-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
        >
          <span className="flex h-8 items-center gap-1 whitespace-nowrap rounded-full border border-white/50 bg-white/15 ps-3 pe-2 text-xs font-bold uppercase tracking-wide">
            {expanded ? t("cardClose") : t("cardOpen")}
            <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} />
          </span>
        </button>
      </div>

      <div id={bodyId} data-card-body className={`${bodyClassName} ${collapsed ? "max-md:hidden" : ""}`}>
        <CardOpenedContext.Provider value={opened}>
          <PhoneCollapsibleContext.Provider value={false}>{children}</PhoneCollapsibleContext.Provider>
        </CardOpenedContext.Provider>
      </div>
    </div>
  );
}
