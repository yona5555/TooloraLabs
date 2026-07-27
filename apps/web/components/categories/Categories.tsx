import Link from "next/link";
import {
  Bot,
  Calculator,
  Code2,
  FileText,
  Folder,
  RefreshCw,
} from "lucide-react";

import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import CategoryCard from "./CategoryCard";

const icons = {
  calculator: <Calculator size={32} strokeWidth={2} />,
  refresh: <RefreshCw size={32} strokeWidth={2} />,
  bot: <Bot size={32} strokeWidth={2} />,
  code: <Code2 size={32} strokeWidth={2} />,
  text: <FileText size={32} strokeWidth={2} />,
  folder: <Folder size={32} strokeWidth={2} />,
};

export default function Categories() {
  return (
    <section
      id="categories"
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
          Explore Categories
        </span>

        <h2 className="mt-6 text-5xl font-extrabold tracking-tight text-zinc-900">
          Find the Right Tool
        </h2>

        <p className="mt-5 text-lg leading-8 text-zinc-600">
          Browse professional online tools organized into categories for
          developers, students, businesses and everyday users.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const count = tools.filter(
            (tool) => tool.category === category.slug
          ).length;

          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
            >
              <CategoryCard
                title={category.title}
                description={category.description}
                tools={`${count} Tool${count !== 1 ? "s" : ""}`}
                icon={icons[category.icon as keyof typeof icons]}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
