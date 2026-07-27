import Link from "next/link";

const links = [
  { href: "#categories", label: "Categories" },
  { href: "#popular-tools", label: "Popular Tools" },
  { href: "#ai-tools", label: "AI Tools" },
  { href: "#developers", label: "Developers" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">

        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
            T
          </div>

          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight text-zinc-900">
              TooloraLabs
            </div>

            <div className="text-xs text-zinc-500">
              Tools & Calculators
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition hover:text-blue-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="hidden rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-blue-200 hover:text-blue-600 md:block"
          >
            Sign In
          </button>

          <button
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Explore
          </button>
        </div>

      </div>
    </header>
  );
}
