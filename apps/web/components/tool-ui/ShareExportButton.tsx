import { Share2 } from "lucide-react";
import type { ReactNode } from "react";
import ResultActionButton from "./ResultActionButton";

const DEFAULT_CLASS =
  "flex items-center gap-1.5 rounded-lg border border-white/40 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 dark:text-zinc-100";

/** The Share / Export trigger every tool's ShareExportModal opens with (a result action). */
export default function ShareExportButton({ onClick, label, className = DEFAULT_CLASS }: { onClick: () => void; label: ReactNode; className?: string }) {
  return (
    <ResultActionButton action="share" onClick={onClick} className={className}>
      <Share2 size={14} />
      {label}
    </ResultActionButton>
  );
}
