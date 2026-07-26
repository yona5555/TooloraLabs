const stats = [
  {
    value: "100%",
    label: "Free to Use",
    icon: "🎁",
  },
  {
    value: "10K+",
    label: "Daily Users",
    icon: "👥",
  },
  {
    value: "120+",
    label: "Categories",
    icon: "🧰",
  },
  {
    value: "1,000+",
    label: "Tools",
    icon: "🚀",
  },
];

export default function Stats() {
  return (
    <div className="mt-12 grid w-full max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            {item.icon}
          </div>

          <h3 className="mt-5 text-3xl font-bold text-zinc-900">
            {item.value}
          </h3>

          <p className="mt-2 text-zinc-500">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
