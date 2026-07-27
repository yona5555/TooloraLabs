const stats = [
  {
    value: "1,000+",
    label: "Online Tools",
    icon: "🧰",
  },
  {
    value: "120+",
    label: "Categories",
    icon: "📂",
  },
  {
    value: "100%",
    label: "Free Forever",
    icon: "⚡",
  },
  {
    value: "24/7",
    label: "Available",
    icon: "🌍",
  },
];

export default function Stats() {
  return (
    <div className="mt-16 grid w-full max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="group rounded-3xl border border-zinc-200 bg-white p-7 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl transition group-hover:scale-110">
            {item.icon}
          </div>

          <h3 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900">
            {item.value}
          </h3>

          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
