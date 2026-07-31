type ToolHeaderProps = {
  title: string;
  description: string;
};

export default function ToolHeader({
  title,
  description,
}: ToolHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>

      <p className="mt-3 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
        {description}
      </p>
    </header>
  );
}
