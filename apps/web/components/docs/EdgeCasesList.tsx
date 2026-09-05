import { ShieldCheck } from "lucide-react";

export type EdgeCase = { title: string; description: string };

export default function EdgeCasesList({ cases }: { cases: EdgeCase[] }) {
  return (
    <div className="flex flex-col gap-4">
      {cases.map((item) => (
        <div key={item.title} className="flex gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">{item.title}</p>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
