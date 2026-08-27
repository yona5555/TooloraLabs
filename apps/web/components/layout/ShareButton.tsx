"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Check, Copy, Mail, Share2 } from "lucide-react";
import Tooltip from "./Tooltip";
import { SITE_URL } from "@/lib/site";
import {
  FacebookIcon,
  LinkedInIcon,
  TelegramIcon,
  WhatsAppIcon,
  XIcon,
} from "@/lib/share-icons";

function subscribeNever() {
  return () => {};
}

function getNativeShareSnapshot() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

function getNativeShareServerSnapshot() {
  return false;
}

export default function ShareButton() {
  const t = useTranslations("share");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(
    subscribeNever,
    getNativeShareSnapshot,
    getNativeShareServerSnapshot
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${SITE_URL}/${locale}${pathname === "/" ? "" : pathname}`;
  const pageTitle = typeof document !== "undefined" ? document.title : "TooloraLabs";

  function close() {
    setOpen(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable in this context; nothing to recover
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title: pageTitle, url: shareUrl });
      close();
    } catch {
      // cancelled by user or unsupported; leave the menu open
    }
  }

  const platformLinks = [
    {
      key: "whatsapp",
      href: `https://wa.me/?text=${encodeURIComponent(`${pageTitle} ${shareUrl}`)}`,
      Icon: WhatsAppIcon,
    },
    {
      key: "twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(pageTitle)}`,
      Icon: XIcon,
    },
    {
      key: "facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      Icon: FacebookIcon,
    },
    {
      key: "telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(pageTitle)}`,
      Icon: TelegramIcon,
    },
    {
      key: "linkedin",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      Icon: LinkedInIcon,
    },
  ] as const;

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Tooltip label={t("share")} hidden={open}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={t("share")}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
        >
          <Share2 size={18} />
        </button>
      </Tooltip>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full items-center gap-3 px-4 py-2 text-start text-sm text-zinc-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t("copied") : t("copyLink")}
          </button>

          {platformLinks.map(({ key, href, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={close}
              className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
            >
              <Icon size={16} />
              {t(key)}
            </a>
          ))}

          <a
            href={`mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(shareUrl)}`}
            role="menuitem"
            onClick={close}
            className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
          >
            <Mail size={16} />
            {t("email")}
          </a>

          {canNativeShare && (
            <button
              type="button"
              role="menuitem"
              onClick={handleNativeShare}
              className="flex w-full items-center gap-3 border-t border-zinc-100 px-4 py-2 text-start text-sm text-zinc-700 transition hover:bg-blue-50 hover:text-blue-600 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
            >
              <Share2 size={16} />
              {t("shareViaApps")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
