import { ReactNode } from "react";

type ToolAboveFoldProps = {
  input: ReactNode;
  result: ReactNode;
  sidebar: ReactNode;
};

export default function ToolAboveFold({ input, result, sidebar }: ToolAboveFoldProps) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[320px_minmax(360px,1fr)_320px]">
      <div className="h-full">{input}</div>
      <div className="h-full">{result}</div>
      <div className="hidden h-full lg:block">{sidebar}</div>
    </div>
  );
}
