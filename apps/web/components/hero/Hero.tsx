import SearchBar from "./SearchBar";
import Stats from "./Stats";

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-24 pb-20 text-center">

      <span className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-600">
        ⚡ Powerful • Fast • Easy to Use
      </span>

      <h1 className="mt-8 max-w-5xl text-6xl font-extrabold leading-tight tracking-tight text-zinc-900">
        All the Tools You Need
        <br />
        <span className="text-blue-600">
          in One Place
        </span>
      </h1>

      <p className="mt-8 max-w-3xl text-xl leading-8 text-zinc-600">
        Free online tools, calculators, converters and generators
        to help you work faster and smarter.
      </p>

      <SearchBar />

      <Stats />

    </section>
  );
}
