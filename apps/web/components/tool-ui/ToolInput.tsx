import { InputHTMLAttributes } from "react";

type ToolInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export default function ToolInput({
  label,
  hint,
  className = "",
  ...props
}: ToolInputProps) {
  return (
    <label className="block space-y-2">
      {label && (
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
      )}

      <input
        {...props}
        className={`w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20 ${className}`}
      />

      {hint && (
        <span className="block text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </span>
      )}
    </label>
  );
}
