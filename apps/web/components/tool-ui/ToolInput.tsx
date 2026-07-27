import { InputHTMLAttributes } from "react";

type ToolInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function ToolInput(props: ToolInputProps) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-lg outline-none transition focus:border-blue-500"
    />
  );
}
