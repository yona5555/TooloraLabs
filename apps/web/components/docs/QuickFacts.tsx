import type { LucideIcon } from "lucide-react";

export type QuickFact = { icon: LucideIcon; label: string; value: string };

export default function QuickFacts({ facts }: { facts: QuickFact[] }) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <fact.icon size={18} className="text-blue-600 dark:text-blue-400" />
          <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">{fact.value}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{fact.label}</p>
        </div>
      ))}
    </div>
  );
}
