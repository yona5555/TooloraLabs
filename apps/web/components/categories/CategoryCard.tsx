import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

type CategoryCardProps = {
  title: string;
  description: string;
  tools: string;
  icon: ReactNode;
};

export default function CategoryCard({
  title,
  description,
  tools,
  icon,
}: CategoryCardProps) {
  return (
    <div className="group rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="mt-8 text-2xl font-bold text-zinc-900">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-zinc-600">
        {description}
      </p>

      <div className="mt-10 flex items-center justify-between">

        <span className="font-medium text-zinc-500">
          {tools}
        </span>

        <ArrowRight
          size={20}
          className="text-blue-600 transition-transform duration-300 group-hover:translate-x-1"
        />

      </div>

    </div>
  );
}
