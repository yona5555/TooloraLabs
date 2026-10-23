"use client";
import { createContext, useContext, useId, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { PHONE_QUERY } from "./cardPrepaint";

type SectionCardProps = {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
  /** Anchor id for in-page navigation (e.g. SectionNav) — adds scroll-margin so sticky headers don't cover the target. */
  id?: string;
};

const headerClassName =
  "flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 text-start lg:px-6 lg:py-3";

/**
 * False while the card is collapsed on phone and has never been opened: heavy children (3D scenes,
 * canvas charts) wait for it before mounting. Always true on desktop and outside a SectionCard.
 */
const CardOpenedContext = createContext(true);
export const useCardOpened = () => useContext(CardOpenedContext);

/**
 * Phone collapsible cards (Yousef 2026-10-23). Below 768px a card can collapse to its blue header with
 * the chevron button at the end of the header (down = collapsed, up = open). The first 3 cards on the
 * page are always open with no chevron; later cards start collapsed (`CARD_PREPAINT_SCRIPT`). The body stays in the HTML, hidden with
 * CSS only (globals.css "Phone collapsible cards"). Desktop never sees the button or the collapse.
 *
 * `data-state`: "auto" until the visitor toggles (the prepaint rules decide), then "open" / "closed".
 */
export default function SectionCard({
  title,
  action,
  children,
  bodyClassName = "p-4 lg:p-6",
  className = "",
  id,
}: SectionCardProps) {
  const t = useTranslations("common");
  const key = useId();
  const bodyId = `${key}-body`;
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"auto" | "open" | "closed">("auto");
  // Server default false: the chevron only shows on phone cards 4+, which start collapsed.
  const [expanded, setExpanded] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [opened, setOpened] = useState(true);
  const [animating, setAnimating] = useState(false);

  // What CSS shows for "auto" (the server cannot know the viewport or which cards come first).
  useLayoutEffect(() => {
    const card = cardRef.current;
    const body = bodyRef.current;
    if (!card || !body || state !== "auto") return;
    const read = () => {
      const phone = window.matchMedia(PHONE_QUERY).matches;
      const open = !phone || getComputedStyle(body).visibility !== "hidden";
      setFixed(phone && getComputedStyle(card).getPropertyValue("--card-fixed").trim() === "1");
      setExpanded(open);
      setOpened((was) => open || (was && !phone));
    };
    read();
    const mq = window.matchMedia(PHONE_QUERY);
    mq.addEventListener("change", read);
    window.addEventListener("cards:first", read);
    return () => {
      mq.removeEventListener("change", read);
      window.removeEventListener("cards:first", read);
    };
  }, [state]);

  function toggle() {
    if (fixed) return;
    const next = !expanded;
    setState(next ? "open" : "closed");
    setExpanded(next);
    if (next) setOpened(true);
    setAnimating(true);
    window.setTimeout(() => setAnimating(false), 260);
  }

  // The whole header toggles on phone too, except clicks on its own controls (fullscreen, tabs…).
  function onHeaderClick(e: MouseEvent<HTMLElement>) {
    if (!window.matchMedia(PHONE_QUERY).matches) return;
    if ((e.target as Element).closest("button, a, input, select, textarea, [role=button], [role=tab]")) return;
    toggle();
  }

  const heading = <h2 className="font-bold text-white max-md:me-auto">{title}</h2>;
  const chevron = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      aria-expanded={expanded}
      aria-controls={bodyId}
      aria-label={t("cardToggle")}
      data-card-toggle=""
      className="-my-2.5 -me-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white md:hidden"
    >
      <ChevronDown
        size={20}
        aria-hidden="true"
        className={`transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
      />
    </button>
  );

  return (
    <div
      ref={cardRef}
      id={id}
      data-bp-panel
      data-card=""
      data-state={state}
      data-animating={animating ? "" : undefined}
      className={`rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none ${id ? "scroll-mt-32" : ""} ${className}`}
    >
      <div data-card-header="" onClick={onHeaderClick} className={`${headerClassName} max-md:cursor-pointer`}>
        {heading}
        {action}
        {chevron}
      </div>

      <div ref={bodyRef} id={bodyId} data-card-body className={bodyClassName}>
        <CardOpenedContext.Provider value={opened}>{children}</CardOpenedContext.Provider>
      </div>
    </div>
  );
}
