import {
  Calculator,
  RefreshCw,
  Bot,
  Code2,
  FileText,
  Folder,
} from "lucide-react";

import CategoryCard from "./CategoryCard";

const categories = [
  {
    title: "Calculators",
    description: "Math, finance, health and more",
    tools: "15+ Tools",
    icon: <Calculator size={32} strokeWidth={2} />,
  },
  {
    title: "Converters",
    description: "Convert units, currency and files",
    tools: "12+ Tools",
    icon: <RefreshCw size={32} strokeWidth={2} />,
  },
  {
    title: "AI Tools",
    description: "AI generators and assistants",
    tools: "10+ Tools",
    icon: <Bot size={32} strokeWidth={2} />,
  },
  {
    title: "Developer Tools",
    description: "Coding and debugging utilities",
    tools: "18+ Tools",
    icon: <Code2 size={32} strokeWidth={2} />,
  },
  {
    title: "Text Tools",
    description: "Text editing and formatting",
    tools: "14+ Tools",
    icon: <FileText size={32} strokeWidth={2} />,
  },
  {
    title: "File Tools",
    description: "Compress, convert and optimize",
    tools: "10+ Tools",
    icon: <Folder size={32} strokeWidth={2} />,
  },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-zinc-900">
            Browse Tools by Category
          </h2>

          <p className="mt-3 text-lg text-zinc-500">
            Discover hundreds of free online tools.
          </p>
        </div>

        <a
          href="#"
          className="rounded-xl border border-zinc-200 px-5 py-3 font-semibold transition hover:bg-zinc-50"
        >
          View All →
        </a>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.title}
            title={category.title}
            description={category.description}
            tools={category.tools}
            icon={category.icon}
          />
        ))}
      </div>
    </section>
  );
}
