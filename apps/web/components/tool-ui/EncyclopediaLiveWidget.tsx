import { ReactNode } from "react";

type EncyclopediaLiveWidgetProps = {
  title: string;
  children: ReactNode;
};

/**
 * Visual shell for a client-interactive ("use client") widget embedded
 * inside an otherwise fully static, server-rendered EncyclopediaPaper
 * section — the blue label is the only signal distinguishing it from the
 * surrounding static prose, since the paper's serif/cream styling itself
 * is unchanged. Holds no state itself, so it stays a plain component; the
 * "use client" boundary belongs to whatever interactive content is passed
 * in as children.
 */
export default function EncyclopediaLiveWidget({ title, children }: EncyclopediaLiveWidgetProps) {
  return (
    <div className="not-italic rounded-lg border border-current/20 bg-current/[0.03] p-4 sm:p-6">
      <p className="mb-3 text-xs font-bold tracking-wide text-blue-600 uppercase dark:text-blue-400">{title}</p>
      {children}
    </div>
  );
}
