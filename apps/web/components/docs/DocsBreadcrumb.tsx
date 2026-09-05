import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Crumb = { label: string; href?: string };

export default function DocsBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={13} className="shrink-0 rtl:rotate-180" />}
          {item.href ? (
            <Link href={item.href} className="transition hover:text-blue-600 dark:hover:text-blue-400">
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-700 dark:text-zinc-200">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
