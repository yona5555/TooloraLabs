import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          TooloraLabs
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Home
          </Link>

          <a href="#categories" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Categories
          </a>

          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            About
          </Link>
        </nav>

        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Explore
        </Link>
      </div>
    </header>
  );
}
