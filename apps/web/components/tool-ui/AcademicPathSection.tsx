export type University = { name: string; note: string; url: string; online: string };

type AcademicPathSectionProps = {
  title: string;
  intro: string;
  universities: University[];
};

export default function AcademicPathSection({ title, intro, universities }: AcademicPathSectionProps) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2">{intro}</p>
      <ul className="mt-4 space-y-4">
        {universities.map((uni) => (
          <li key={uni.name} className="rounded-sm border border-current/20 p-4">
            <p className="font-semibold">{uni.name}</p>
            <p className="mt-1 text-sm opacity-80">{uni.note}</p>
            <p className="mt-1 text-sm opacity-80">{uni.online}</p>
            <a
              href={uni.url}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="mt-2 block max-w-full break-all text-sm font-medium underline decoration-dotted underline-offset-4"
            >
              {uni.url.replace(/^https?:\/\//, "")}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
