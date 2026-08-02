import { ReactNode } from "react";

type ToolAboveFoldProps = {
  input: ReactNode;
  result: ReactNode;
  sidebar: ReactNode;
};

export default function ToolAboveFold({ input, result, sidebar }: ToolAboveFoldProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(360px,1fr)_300px]">
      <div>{input}</div>
      <div>{result}</div>
      <div className="hidden space-y-6 lg:block">{sidebar}</div>
    </div>
  );
}
