type Props = {
  title: string;
  version: string;
  description: string;
};

export default function DocsHero({ title, version, description }: Props) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">{version}</span>
      </div>
      <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">{description}</p>
    </div>
  );
}
