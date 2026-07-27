type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
        Category
      </span>

      <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-zinc-900">
        {slug.replace(/-/g, " ")}
      </h1>

      <p className="mt-6 text-lg text-zinc-600">
        Browse all tools in this category.
      </p>
    </main>
  );
}
